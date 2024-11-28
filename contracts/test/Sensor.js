const PatientSensorContract = artifacts.require("DeviceOwner");

contract("PatientSensorContract", (accounts) => {
    const [patientOwner, unauthorizedUser, sensorOwner, anotherSensorOwner] = accounts;
    const patientAddress = accounts[1];
    const sensorAddress = sensorOwner;
    const anotherSensorAddress = anotherSensorOwner;

    let contractInstance;

    before(async () => {
        contractInstance = await PatientSensorContract.deployed();
    });

    it("should set patient owner", async () => {
        await contractInstance.setPatientOwner(patientAddress, patientOwner, { from: patientOwner });
        const owner = await contractInstance.patientOwners(patientAddress);
        assert.equal(owner, patientOwner, "Patient owner was not set correctly");
    });

    it("should allow patient owner to add a sensor", async () => {
        await contractInstance.addSensorForPatient(patientAddress, sensorAddress, { from: patientOwner });
        const sensor = await contractInstance.patientSensors(patientAddress, sensorAddress);
        assert.equal(sensor.owner, patientOwner, "Sensor owner is incorrect");
        assert.equal(sensor.isActive, true, "Sensor should be active");
    });

    it("should allow sensor to push data if active", async () => {
        const testData = "Vital signs data";
        const tx = await contractInstance.pushDataForPatient(patientAddress, testData, { from: sensorAddress });
        assert.equal(tx.logs[0].event, "DataPushed", "DataPushed event was not emitted");
        assert.equal(tx.logs[0].args.patient, patientAddress, "Incorrect patient in event");
        assert.equal(tx.logs[0].args.sensor, sensorAddress, "Incorrect sensor in event");
        assert.equal(tx.logs[0].args.data, testData, "Incorrect data in event");
    });

    it("should not allow inactive or unauthorized sensor to push data", async () => {
        // Revoke sensor to make it inactive
        await contractInstance.revokeSensorForPatient(patientAddress, sensorAddress, { from: patientOwner });

        try {
            await contractInstance.pushDataForPatient(patientAddress, "Unauthorized data push attempt", { from: sensorAddress });
            assert.fail("Inactive sensor should not be allowed to push data");
        } catch (error) {
            assert(error.message.includes("Sensor not authorized or inactive"), "Expected 'Sensor not authorized or inactive' error");
        }

        // Test unauthorized sensor that was never added
        try {
            await contractInstance.pushDataForPatient(patientAddress, "Unauthorized data push attempt", { from: anotherSensorAddress });
            assert.fail("Unauthorized sensor should not be allowed to push data");
        } catch (error) {
            assert(error.message.includes("Sensor not authorized or inactive"), "Expected 'Sensor not authorized or inactive' error");
        }
    });
});

