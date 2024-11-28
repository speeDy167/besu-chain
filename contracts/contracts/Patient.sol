// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract PatientRecord {
    address public admin;

    struct Patient {
        uint8 patientId;
        string department;
        string socialInsuranceNumber;
        string gender;
        string medicalHistory;
        string dateOfBirth;
        uint256 timestamp;
    }

    mapping(uint8 => Patient) private patients;

    event PatientCreated(uint8 patientId, string department, string socialInsuranceNumber, string gender, string medicalHistory, string dateOfBirth, uint256 timestamp);   
    event PatientUpdated(uint8 patientId, string department, string socialInsuranceNumber, uint256 timestamp);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function createPatient(
        uint8 _patientId,
        string memory _department,
        string memory _socialInsuranceNumber,
        string memory _gender,
        string memory _medicalHistory,
        string memory _dateOfBirth
    ) public onlyAdmin {
        patients[_patientId] = Patient({
            patientId: _patientId,
            department: _department,
            socialInsuranceNumber: _socialInsuranceNumber,
            gender: _gender,
            medicalHistory: _medicalHistory,
            dateOfBirth: _dateOfBirth,
            timestamp: block.timestamp
        });
        emit PatientCreated(_patientId, _department, _socialInsuranceNumber, _gender, _medicalHistory, _dateOfBirth, block.timestamp);
    }

    function updatePatient(
        uint8 _patientId,
        string memory _department,
        string memory _socialInsuranceNumber
    ) public onlyAdmin {
        Patient storage patient = patients[_patientId];
        patient.department = _department;
        patient.socialInsuranceNumber = _socialInsuranceNumber;
        patient.timestamp = block.timestamp;
        emit PatientUpdated(_patientId, _department, _socialInsuranceNumber, block.timestamp);
    }

    // Getter function to retrieve patient details
    function getPatient(uint8 _patientId)
        public
        view
        returns (
            uint8,
            string memory,
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        Patient storage patient = patients[_patientId];
        return (
            patient.patientId,
            patient.department,
            patient.socialInsuranceNumber,
            patient.gender,
            patient.medicalHistory,
            patient.dateOfBirth,
            patient.timestamp
        );
    }
}

