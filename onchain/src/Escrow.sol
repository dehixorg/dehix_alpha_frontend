// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DehixEscrow is Ownable {
    using SafeERC20 for IERC20;

    enum State { Created, Locked, Released, Disputed, Resolved }

    struct Escrow {
        address client;
        address freelancer;
        address token;
        uint256 amount;
        State state;
    }

    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCounter;

    event EscrowCreated(uint256 indexed id, address client, address freelancer, uint256 amount);
    event DisputeRaised(uint256 indexed id);
    event Resolved(uint256 indexed id, address winner);

    constructor() Ownable(msg.sender) {}

    function createEscrow(address _freelancer, address _token, uint256 _amount) external {
        require(_amount > 0, "Amount must be > 0");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        escrows[escrowCounter] = Escrow({
            client: msg.sender,
            freelancer: _freelancer,
            token: _token,
            amount: _amount,
            state: State.Locked
        });

        emit EscrowCreated(escrowCounter, msg.sender, _freelancer, _amount);
        escrowCounter++;
    }

    function releaseFunds(uint256 _escrowId) external {
        Escrow storage e = escrows[_escrowId];
        require(msg.sender == e.client, "Only client can release");
        require(e.state == State.Locked || e.state == State.Disputed, "Invalid state");

        e.state = State.Released;
        IERC20(e.token).safeTransfer(e.freelancer, e.amount);
    }

    function raiseDispute(uint256 _escrowId) external {
        Escrow storage e = escrows[_escrowId];
        require(msg.sender == e.client || msg.sender == e.freelancer, "Not a party");
        require(e.state == State.Locked, "Cannot dispute now");

        e.state = State.Disputed;
        emit DisputeRaised(_escrowId);
    }

    function resolveDispute(
        uint256 _escrowId,
        uint256 clientShare,
        uint256 freelancerShare
    ) external onlyOwner {
        Escrow storage e = escrows[_escrowId];
        require(e.state == State.Disputed, "Not disputed");
        require(clientShare + freelancerShare <= e.amount, "Amounts exceed balance");

        e.state = State.Resolved;

        if (clientShare > 0) IERC20(e.token).safeTransfer(e.client, clientShare);
        if (freelancerShare > 0) IERC20(e.token).safeTransfer(e.freelancer, freelancerShare);

        emit Resolved(_escrowId, msg.sender);
    }
}
