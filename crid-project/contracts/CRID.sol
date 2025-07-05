// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.20;

contract CRID {
    // --- State Variables ---

    address public immutable coordinator;
    address public immutable student;
    uint256 public immutable enrollmentDeadline;

    bool public isEnrolled;
    // ALTERAÇÃO 1: Mudando para 'private'
    string[] private enrolledCourses;

    // --- Events ---
    event EnrollmentFinalized(address indexed student, string[] courses);
    event EnrollmentCancelled(address indexed student, uint256 timestamp);

    // --- Errors ---
    error NotTheStudent();
    error NotTheCoordinator();
    error DeadlineExpired();
    error DeadlineNotReached();
    error AlreadyEnrolled();
    error InvalidSignature();

    constructor(address _studentAddress, uint256 _duration) {
        coordinator = msg.sender;
        student = _studentAddress;
        enrollmentDeadline = block.timestamp + _duration;
    }

    function enroll(string[] memory _courses, bytes memory _signature) external {
        if (msg.sender != student) revert NotTheStudent();
        if (block.timestamp >= enrollmentDeadline) revert DeadlineExpired();
        if (isEnrolled) revert AlreadyEnrolled();

        bytes32 messageHash = getMessageHash(_courses);
        if (!_isValidSignature(messageHash, _signature)) {
            revert InvalidSignature();
        }

        enrolledCourses = _courses;
        isEnrolled = true;

        emit EnrollmentFinalized(student, _courses);
    }

    function cancelByTimeout() external {
        if (msg.sender != coordinator) revert NotTheCoordinator();
        if (block.timestamp < enrollmentDeadline) revert DeadlineNotReached();
        if (isEnrolled) revert AlreadyEnrolled();
        
        isEnrolled = true;
        emit EnrollmentCancelled(student, block.timestamp);
    }

    // --- View/Pure Functions ---

    // ALTERAÇÃO 2: Adicionando getter explícito
    /**
     * @dev Retorna a lista completa de disciplinas em que o aluno se inscreveu.
     */
    function getEnrolledCourses() external view returns (string[] memory) {
        return enrolledCourses;
    }

    function getMessageHash(string[] memory _courses) public view returns (bytes32) {
        return keccak256(abi.encode(address(this), _courses));
    }
    
    function _getEthSignedMessageHash(bytes32 _messageHash) private pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", _messageHash));
    }

    function _isValidSignature(bytes32 _messageHash, bytes memory _signature) private view returns (bool) {
        bytes32 ethSignedMessageHash = _getEthSignedMessageHash(_messageHash);
        address signer = _recoverSigner(ethSignedMessageHash, _signature);
        return signer == coordinator;
    }

    function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) private pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _splitSignature(bytes memory sig) private pure returns (bytes32 r, bytes32 s, uint8 v) {
        if (sig.length != 65) revert InvalidSignature();
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}