_When i first heard about [Proof of Humanity](https://www.proofofhumanity.id/) (a social identity verification system for humans on Ethereum) and its UBI token, what caught my attention, aside from the philanthropic nature of the project, was that the project used a very clever technique to distribute an universal basic income (UBI) token to verified humans. This post is inspired by this project and aims to explain how tokens can be streamed in real time to other addresses without using gas at all._

## A typical token transfer

In a regular scenario, a token using the ERC20 standard, can be minted and transferred to an address. Under the hood what this transfer actually does, is keeping track of how many tokens an address has, using a mapping like the following:

```solidity
mapping(address => uint256) private balances
```

Editing this mapping alters the state of the contract, and since this involves a transaction, it costs gas.

Following the same standard, reading from the balances mapping will be done using the `balanceOf(address account)` function. Since reading doesn't alter the state of the contract, this function call will be costless.
**This is key to understand the technique behind token dripping/streaming.**

## Dripping tokens into a wallet

Now lets say that we need to transfer X amount of tokens each Y amount of time. Using the regular approach described previously, this would involve a recurring transfer, which would involve spending gas regularly with each transfer.

Since this scenario is time dependant we can actually keep track of the time elapsed and calculate how many tokens belong to that address on the fly, without actually keeping track of it on the balances mapping (saving us from spending gas on this).

**But where is the streaming?**

Since we have the ERC20 standard as an interface to guarantee interoperability, we can rely that wallets or any piece of software we are using, will be calling `balanceOf` function to get the address balance.

In this case since we are calculating on the fly the amount of tokens in the balance while keeping track of the time elapsed, the result would be (if not other conditions apply), an increasing amount of tokens on the address balance. As a quick example, at the time of this post, Metamask checks `balanceOf` around each 20 seconds, which will result in tokens streaming / dripping into your wallet, each 20 secs.

**But how do we keep track of time elapsed?**

Using `block.timestamp` we can actually access the UNIX epoch of the current block, so we can actually track the time difference, between the block an address registered for the token drip, and the current block. This involves a simple piece of code like this:

```solidity
mapping(address => uint256) private startTime;

function register() public {
    startTime[msg.sender] = block.timestamp;
}
```

## A working example

Once a starting time is registered (as in the code above), its just a matter of checking the time elapsed on our `balanceOf` function that will be called by our wallet. We can do that by calculating the difference between the timestamp of the block when we registered our address in the mapping, and the timestamp of the current block, and multiplying that difference for an X amount of tokens that we want to allocate to a unit of time.

The following is a quick but working example of how a time dependant `balanceOf` function can be achieved.

```solidity
uint256 private tokenPerSecond = 1;

function isRegistered(address account) public view returns (bool) {
    return startTime[account] != 0;
}

function balanceOf(address account) public view returns (uint256) {
    // if registered, return balance
    if (isRegistered(account)) {
        uint256 timeSinceStart = block.timestamp.sub(
            startTime[account],
            "Subtraction cannot overflow"
        );
        uint256 tokensInBalance = timeSinceStart.mul(tokenPerSecond);
        return tokensInBalance;
    }
    // if not registered, return 0
    return 0;
}
```

## A final note on streaming while being ERC20 compliant

The previous example is not fully ERC20 compliant since it doesn't show how those tokens accrued over time could be transferred or what the total supply is. For example, [UBI tokens](https://www.proofofhumanity.id/) does not take into account tokens minted as UBI by an address before it moves those (transfer or burn).

For this particular example, while the solution to follow a similar strategy is not that complex, it would involve a second post.
