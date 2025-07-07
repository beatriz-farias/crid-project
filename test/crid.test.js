const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const { utils } = require("ethers")

describe("CRID Contract", function () {
    let crid;
    let coordinator, student, other;
    const DURATION = 2 * 24 * 60 * 60; // 2 dias de prazo
    const courses = ["CS101", "MA211", "PH301"];

    async function signEnrollment(signer, courseList) {
        const messageHash = await crid.getMessageHash(courseList);
        const signature = await signer.signMessage(ethers.arrayify(messageHash));
        return signature;
}

    beforeEach(async function () {
        [coordinator, student, other] = await ethers.getSigners();
        const CRIDFactory = await ethers.getContractFactory("CRID");
        crid = await CRIDFactory.connect(coordinator).deploy(student.address, DURATION);
    });

    describe("Deployment", function () {
        it("Should set the right coordinator and student", async function () {
            expect(await crid.coordinator()).to.equal(coordinator.address);
            expect(await crid.student()).to.equal(student.address);
        });

        it("Should set the correct enrollment deadline", async function () {
            // Aqui usa ethers.provider para pegar o bloco
            const block = await ethers.provider.getBlock("latest");
            const expectedDeadline = block.timestamp + DURATION;
            expect(await crid.enrollmentDeadline()).to.be.closeTo(
                BigInt(expectedDeadline),
                5
            );
        });
    });

    describe("Enrollment", function () {
        it("Should allow a student to enroll with a valid signature from the coordinator", async function () {
            const signature = await signEnrollment(coordinator, courses);
            
            await expect(crid.connect(student).enroll(courses, signature))
                .to.emit(crid, "EnrollmentFinalized")
                .withArgs(student.address, courses);

            expect(await crid.isEnrolled()).to.be.true;

            const retrievedCourses = await crid.getEnrolledCourses();
            expect(retrievedCourses).to.deep.equal(courses);
        });

        // Os outros testes mantêm a mesma estrutura, apenas garanta que usam ethers do hardhat
        it("Should revert if the signature is invalid (signed by another account)", async function () {
            const signature = await signEnrollment(other, courses);
            
            await expect(crid.connect(student).enroll(courses, signature))
                .to.be.revertedWithCustomError(crid, "InvalidSignature");
        });

        it("Should revert if a non-student tries to enroll", async function () {
            const signature = await signEnrollment(coordinator, courses);
            
            await expect(crid.connect(other).enroll(courses, signature))
                .to.be.revertedWithCustomError(crid, "NotTheStudent");
        });

        it("Should revert if enrollment is attempted after the deadline", async function () {
            const signature = await signEnrollment(coordinator, courses);
            
            await time.increase(DURATION + 1);
            
            await expect(crid.connect(student).enroll(courses, signature))
                .to.be.revertedWithCustomError(crid, "DeadlineExpired");
        });

        it("Should revert if trying to enroll twice", async function () {
            const signature = await signEnrollment(coordinator, courses);
            await crid.connect(student).enroll(courses, signature);

            await expect(crid.connect(student).enroll(courses, signature))
                .to.be.revertedWithCustomError(crid, "AlreadyEnrolled");
        });
    });

    describe("Timeout Cancellation", function () {
        it("Should allow the coordinator to cancel the enrollment after the deadline", async function () {
            await time.increase(DURATION + 1);
            
            await expect(crid.connect(coordinator).cancelByTimeout())
                .to.emit(crid, "EnrollmentCancelled");

            expect(await crid.isEnrolled()).to.be.true;
        });

        it("Should revert if the coordinator tries to cancel before the deadline", async function () {
            await expect(crid.connect(coordinator).cancelByTimeout())
                .to.be.revertedWithCustomError(crid, "DeadlineNotReached");
        });

        it("Should revert if a non-coordinator tries to cancel", async function () {
            await time.increase(DURATION + 1);
            
            await expect(crid.connect(student).cancelByTimeout())
                .to.be.revertedWithCustomError(crid, "NotTheCoordinator");
        });
    });
});
