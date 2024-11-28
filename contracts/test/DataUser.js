const PatientRecord = artifacts.require("PatientRecord");

contract("PatientRecord", (accounts) => {
    let patientRecord;
    const admin = accounts[0];
    const nonAdmin = accounts[1];

    before(async () => {
        patientRecord = await PatientRecord.deployed();
    });

    it("should set the deployer as the admin", async () => {
        const contractAdmin = await patientRecord.admin();
        assert.equal(contractAdmin, admin, "Deployer should be the admin");
    });

    it("should allow admin to create a patient record", async () => {
        await patientRecord.createPatient(1, "John Doe", 30, "None", 70, 120, 98, { from: admin });
        const patient = await patientRecord.getPatient(1);
        assert.equal(patient[1], "John Doe", "Patient name should be 'John Doe'");
        assert.equal(patient[2], 30, "Patient age should be 30");
        assert.equal(patient[3], "None", "Patient medical history should be 'None'");
        assert.equal(patient[4], 70, "Heart rate should be 70");
        assert.equal(patient[5], 120, "Blood pressure should be 120");
        assert.equal(patient[6], 98, "Temperature should be 98");
    });

    it("should not allow non-admin to create a patient record", async () => {
        try {
            await patientRecord.createPatient(2, "Jane Doe", 25, "Asthma", 75, 115, 99, { from: nonAdmin });
            assert.fail("Non-admin should not be able to create a patient");
        } catch (error) {
            assert(error.message.includes("Only admin can perform this action"), "Expected only admin restriction error");
        }
    });

    it("should allow admin to update a patient record", async () => {
        await patientRecord.updatePatient(1, "John Smith", 31, "Allergies", { from: admin });
        const patient = await patientRecord.getPatient(1);
        assert.equal(patient[1], "John Smith", "Patient name should be updated to 'John Smith'");
        assert.equal(patient[2], 31, "Patient age should be updated to 31");
        assert.equal(patient[3], "Allergies", "Patient medical history should be updated to 'Allergies'");
    });

    it("should not allow non-admin to update a patient record", async () => {
        try {
            await patientRecord.updatePatient(1, "Jane Smith", 26, "Asthma", { from: nonAdmin });
            assert.fail("Non-admin should not be able to update a patient");
        } catch (error) {
            assert(error.message.includes("Only admin can perform this action"), "Expected only admin restriction error");
        }
    });

    it("should allow admin to update patient vital signs", async () => {
        await patientRecord.updateVitalSigns(1, 72, 110, 97, { from: admin });
        const patient = await patientRecord.getPatient(1);
        assert.equal(patient[4], 72, "Heart rate should be updated to 72");
        assert.equal(patient[5], 110, "Blood pressure should be updated to 110");
        assert.equal(patient[6], 97, "Temperature should be updated to 97");
    });

    it("should not allow non-admin to update patient vital signs", async () => {
        try {
            await patientRecord.updateVitalSigns(1, 76, 118, 98, { from: nonAdmin });
            assert.fail("Non-admin should not be able to update vital signs");
        } catch (error) {
            assert(error.message.includes("Only admin can perform this action"), "Expected only admin restriction error");
        }
    });
});

