import { sendEmail } from "../../src/config/mailer";

jest.mock("nodemailer", () => {
    const sendMail = jest.fn();
    return {
        __esModule: true,
        default: {
            createTransport: jest.fn(() => ({ sendMail }))
        }
    };
});

const nodemailer = require("nodemailer").default;

describe("mailer utility - unit", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.EMAIL_USER = "test@example.com";
        process.env.EMAIL_PASSWORD = "pwd";
    });

    test("returns success when provider accepts message", async () => {
        nodemailer.createTransport.mockReturnValueOnce({
            sendMail: jest.fn().mockResolvedValue({ accepted: ["x"], rejected: [] })
        });

        const res = await sendEmail("to@e.com", "Subj", "Msg", "<b>Msg</b>");
        expect(res).toBe("Email sent successfully");
    });

    test("returns not sent when provider rejects", async () => {
        nodemailer.createTransport.mockReturnValueOnce({
            sendMail: jest.fn().mockResolvedValue({ accepted: [], rejected: ["x"] })
        });

        const res = await sendEmail("to@e.com", "Subj", "Msg", "<b>Msg</b>");
        expect(res).toBe("Email not sent");
    });

    test("returns error message when sendMail throws", async () => {
        nodemailer.createTransport.mockReturnValueOnce({
            sendMail: jest.fn().mockRejectedValue(new Error("boom"))
        });

        const res = await sendEmail("to@e.com", "Subj", "Msg", "<b>Msg</b>");
        expect(res).toContain("boom");
    });
});


