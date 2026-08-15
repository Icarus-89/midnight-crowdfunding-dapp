# Compact Contract Details: BBoard

**File**: `contract/src/bboard.compact`  
**Language**: Midnight Compact v0.23  
**License**: Apache License 2.0  
**Project**: @midnight-ntwrk/example-bboard

---

## Contract Overview

The **BBoard contract** implements a decentralized bulletin board system on the Midnight Network. It allows users to:
- **Post** messages to the board (when vacant)
- **Take down** their own messages (ownership verified)
- Maintain message privacy and ownership using cryptographic keys

This is a single-slot bulletin board where only one message can exist at a time.

---

## Language & Imports

```compact
pragma language_version 0.23;
import CompactStandardLibrary;
```

- **Language Version**: Compact 0.23 (Midnight protocol specification)
- **Standard Library**: Imports built-in functions for hashing, type handling, and cryptography

---

## State Definition

### Ledger (Public State)

#### 1. **State Enum**
```compact
export enum State {
  VACANT,
  OCCUPIED
}
export ledger state: State;
```
- Tracks board occupancy
- `VACANT`: No message on board
- `OCCUPIED`: Message currently posted
- **Visibility**: Public ledger (disclosed to observers)

#### 2. **Message Storage**
```compact
export ledger message: Maybe<Opaque<"string">>;
```
- Stores the current message on the board
- **Type**: Optional (Maybe) opaque string
- **Opacity**: Message content is encrypted/private on-chain
- **Disclosure**: Owner/witnesses can access it
- **Value**: `none<T>()` when board is vacant

#### 3. **Sequence Counter**
```compact
export ledger sequence: Counter;
```
- Increments with each post-takedown cycle
- **Purpose**: Prevents replay attacks and ensures unique key derivation
- **Initial Value**: Incremented to 1 in constructor
- **Increments**: 
  - Initially set to 1
  - Incremented each time `takeDown()` executes

#### 4. **Owner Identifier**
```compact
export ledger owner: Bytes<32>;
```
- Stores 32-byte public key of the current post owner
- **Type**: Fixed-size byte array (256 bits)
- **Derivation**: Computed from poster's secret key + sequence number
- **Verification**: Used in `takeDown()` to verify ownership

---

## Constructor

```compact
constructor() {
  state = State.VACANT;
  message = none<Opaque<"string">>();
  sequence.increment(1);
}
```

**Initialization**:
- Sets board to `VACANT`
- Initializes message as empty (none)
- Increments sequence counter from 0 to 1

**Timing**: Executes once when contract is deployed

---

## Witness Function

```compact
witness localSecretKey(): Bytes<32>;
```

- **Purpose**: Private input from the prover/caller
- **Type**: 32-byte private key (256-bit secret)
- **Usage**: Used in both `post()` and `takeDown()` circuits
- **Privacy**: Never exposed on-chain; only used for cryptographic proofs
- **Access**: Only the circuit functions can read this value

---

## Public Circuits (Transactions)

### Circuit 1: `post(newMessage: Opaque<"string">): []`

**Purpose**: Post a new message to the board

**Parameters**:
- `newMessage`: The encrypted message to post
- **Return Type**: Empty array (void)

**Logic**:
```compact
assert(state == State.VACANT, "Attempted to post to an occupied board");
owner = disclose(publicKey(localSecretKey(), sequence as Field as Bytes<32>));
message = disclose(some<Opaque<"string">>(newMessage));
state = State.OCCUPIED;
```

**Execution Steps**:

1. **Validation**: Assert board is `VACANT`
   - Fails with error if board already has a message
   - Ensures only one message at a time

2. **Owner Derivation**: 
   - Calls `publicKey()` with caller's secret key and current sequence
   - Converts sequence counter to Field → Bytes<32>
   - Result is disclosed (stored publicly)
   - Cryptographically proves caller owns this key

3. **Message Storage**:
   - Wraps newMessage in `Some<T>` (from None state)
   - Discloses message on ledger (encrypted/opaque form)
   - Visible to contract but private to network

4. **State Update**:
   - Transitions state from `VACANT` to `OCCUPIED`

**Preconditions**:
- Caller must provide valid witness `localSecretKey()`
- Board must be in `VACANT` state

**Postconditions**:
- `state` = `OCCUPIED`
- `message` = Posted message
- `owner` = Caller's derived public key
- Sequence remains unchanged (no increment)

---

### Circuit 2: `takeDown(): Opaque<"string">`

**Purpose**: Remove a message from the board (only owner can call)

**Parameters**: None  
**Return Type**: Returns the removed message (Opaque<"string">)

**Logic**:
```compact
assert(state == State.OCCUPIED, "Attempted to take down post from an empty board");
assert(owner == publicKey(localSecretKey(), sequence as Field as Bytes<32>), 
       "Attempted to take down post, but not the current owner");
const formerMsg = message.value;
state = State.VACANT;
sequence.increment(1);
message = none<Opaque<"string">>();
return formerMsg;
```

**Execution Steps**:

1. **Board Status Check**:
   - Assert state is `OCCUPIED`
   - Fails if trying to remove from empty board

2. **Ownership Verification**:
   - Derives caller's public key from their secret key + current sequence
   - Compares derived key with stored `owner`
   - Must match exactly to proceed
   - Proves caller is the original poster

3. **Message Extraction**:
   - Retrieves message from Maybe monad using `.value`
   - Stores in temporary constant `formerMsg`

4. **State Reset**:
   - Sets state back to `VACANT`
   - Allows next user to post

5. **Sequence Increment**:
   - Increments counter by 1
   - Invalidates old public key
   - Prevents reuse of same key in future posts

6. **Message Clearing**:
   - Resets message to `none<T>()` (empty)

7. **Return Value**:
   - Returns the removed message to caller
   - Allows verification/logging of what was taken down

**Preconditions**:
- Board must be in `OCCUPIED` state
- Caller's derived public key must match stored `owner`
- Caller must provide correct `localSecretKey()` witness

**Postconditions**:
- `state` = `VACANT`
- `message` = None (empty)
- `owner` = Unchanged (but irrelevant after board is vacant)
- `sequence` = Incremented by 1

---

### Helper Circuit 3: `publicKey(sk: Bytes<32>, sequence: Bytes<32>): Bytes<32>`

**Purpose**: Derive deterministic public key from secret key and sequence

**Parameters**:
- `sk`: Secret key (32 bytes)
- `sequence`: Sequence counter (32 bytes)

**Return Type**: 32-byte public key

**Implementation**:
```compact
return persistentHash<Vector<3, Bytes<32>>>([pad(32, "bboard:pk:"), sequence, sk]);
```

**Cryptographic Breakdown**:

1. **Input Vector** (3 elements):
   - `pad(32, "bboard:pk:")`: Domain separator string padded to 32 bytes
     - Namespace: "bboard:pk:" (unique to this contract)
     - Padding: Right-padded with null bytes to 32 bytes
     - Prevents hash collisions with other schemes
   
   - `sequence`: Current counter value (32 bytes)
     - Ensures different keys for each post cycle
     - Prevents owner reidentification across posts
   
   - `sk`: Secret key (32 bytes)
     - Private input, never disclosed on-chain

2. **Hashing**:
   - `persistentHash<Vector<3, Bytes<32>>>()`: Midnight's cryptographic hash
   - Applied over vector of 3 × 32-byte elements
   - Produces 32-byte output (256-bit hash)

3. **Deterministic Output**:
   - Same inputs always produce same output
   - Used to verify ownership without revealing secret key
   - Public key can be derived by anyone with sk + sequence

**Usage**:
- **In `post()`**: Calculates owner's public key to store on ledger
- **In `takeDown()`**: Recalculates owner's public key to verify ownership

---

## Data Types & Type System

### Custom Types Used

| Type | Description | Example |
|------|-------------|---------|
| `State` | Enum with 2 variants | `VACANT`, `OCCUPIED` |
| `Opaque<"string">` | Encrypted/private string | Message content |
| `Maybe<T>` | Optional type | `Some<T>` or `None` |
| `Counter` | Incrementing state variable | Sequence tracker |
| `Bytes<32>` | Fixed 32-byte array | Keys, hashes |
| `Field` | Finite field element | Used in arithmetic |
| `Vector<3, Bytes<32>>` | Array of 3 × 32-byte items | Hash input |

### Type Conversions

```compact
sequence as Field as Bytes<32>
```
- Converts Counter to Field element
- Then to 32-byte representation
- Used for consistent key derivation

---

## Security Properties

### 1. **Access Control**
- Only post owner can take down their message
- Verified through secret key witness + sequence counter
- No privileged accounts or admins

### 2. **Privacy**
- Message content is opaque (encrypted)
- Not readable by external observers
- Only accessible to contract functions

### 3. **Replay Protection**
- Sequence counter increments after each `takeDown()`
- Prevents reusing old public keys
- Each post cycle has unique derived key

### 4. **Single-Slot Design**
- Only one message on board at a time
- Prevents concurrent posts
- Simpler state management

### 5. **Zero-Knowledge Proofs**
- Secret key never exposed on-chain
- Ownership proven through cryptographic signature
- Prover must generate valid witness and proof

---

## Execution Flow

### Scenario 1: Normal Post + Takedown

```
Initial State: VACANT, sequence=1

1. User A calls post("Hello")
   → Derives pubkey_A from sk_A + 1
   → state = OCCUPIED, message = "Hello", owner = pubkey_A, sequence = 1

2. User A calls takeDown()
   → Verifies pubkey_A matches owner
   → state = VACANT, message = NONE, sequence = 2

3. User B calls post("Goodbye")
   → Derives pubkey_B from sk_B + 2
   → state = OCCUPIED, message = "Goodbye", owner = pubkey_B, sequence = 2
```

### Scenario 2: Failed Takedown (Wrong Owner)

```
State: OCCUPIED, owner = pubkey_A

User B calls takeDown() with sk_B
   → Derives pubkey_B from sk_B + sequence
   → pubkey_B ≠ pubkey_A
   → Assertion fails: "not the current owner"
   → Transaction rejected
```

### Scenario 3: Post to Occupied Board

```
State: OCCUPIED

User C calls post("Try")
   → Assert state == VACANT fails
   → Error: "Attempted to post to an occupied board"
   → Transaction rejected
```

---

## Gas & Performance Considerations

### Computationally Expensive Operations
1. **`persistentHash()`**: Cryptographic hash (used 2× per `takeDown()`)
2. **`disclose()`**: Publishing private data (used in `post()`)
3. **Key derivation**: Full hash computation needed for verification

### Optimization Opportunities
- Sequence stored as Counter (efficient increment)
- Single-slot design minimizes state writes
- No loops or recursive calls

---

## Contract Limitations

1. **Single Message Slot**: Only one message at a time
2. **No Editing**: Must post new message, old one discarded
3. **No Deletion History**: Removed messages not archived
4. **No Metadata**: No timestamps, IPs, or signatures
5. **No Delegation**: Owner cannot authorize others to remove
6. **Immutable Owner**: Cannot change owner after posting

---

## Use Cases

✅ **Good For**:
- Simple message board/bulletin
- Proof-of-concept privacy demonstration
- Testing Midnight contract features
- Temporary anonymous messaging

❌ **Not Suitable For**:
- Multi-user messaging (only single slot)
- Long-term message storage
- High-volume posting
- Complex business logic

---

## Comparison to CrowdFunding (bboard → CrowdRise)

This simple BBoard contract serves as the foundation for **CrowdRise**, the crowdfunding dApp:
- **Extends**: Single-message concept to multi-campaign tracking
- **Adds**: Campaign state, funding targets, deadlines
- **Maintains**: Privacy of donor identities, zero-knowledge verification

---

## References

- **Midnight Network Docs**: https://docs.midnight.network/
- **Compact Language**: Midnight's privacy-preserving smart contract language
- **Zero-Knowledge Proofs**: Enables privacy-preserving computation
- **Project**: @midnight-ntwrk/example-bboard (leveling repo)

