import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { INestApplication, HttpStatus } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";

describe("Auth (e2e)", () => {
    let app: INestApplication;

    let token: string;
    let refreshToken: string;

    const data = {
        new: {
            username: "testuser",
            email: "test.register@zinkapp.co",
            password: "test123",
        },
        sign: {
            email: "test@zinkapp.co",
            password: "qmbHecprgHAA3txP",
        },
    };

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication(new FastifyAdapter());

        await app.init();
        await app
            .getHttpAdapter()
            .getInstance()
            .ready();
    });

    it("Server should response with successfully message when client registers with unique data", done => {
        return request(app.getHttpServer())
            .post("/auth/signup")
            .send(data.new)
            .expect(HttpStatus.CREATED)
            .end((err, res) => {
                if (err) return done(err);

                const { message } = res.body as Record<string | number, string>;

                expect(message).toEqual("Check your e-mail");

                done();
            });
    });

    it("Server should response duplication error when client registers with already used email or name", done => {
        return request(app.getHttpServer())
            .post("/auth/signup")
            .send(data.new)
            .expect(HttpStatus.CONFLICT)
            .end((_, res) => {
                const { message, statusCode } = res.body as Record<
                    string | number,
                    string
                >;

                expect(message).toBe("This email is already using");
                expect(statusCode).toBe(HttpStatus.CONFLICT);

                done();
            });
    });

    it("Server should authorize by sending token when client sends to email and password", done => {
        return request(app.getHttpServer())
            .post("/auth/authorize")
            .send(data.sign)
            .expect(HttpStatus.CREATED)
            .end((err, res) => {
                if (err) return done(err);

                const {
                    message,
                    access_token,
                    refresh_token,
                    expires_in,
                } = res.body as Record<string | number, string>;

                expect(message).toEqual("Successfully Authorized");

                expect(typeof access_token).toBe("string");
                expect(typeof refresh_token).toBe("string");
                expect(typeof expires_in).toBe("number");

                token = access_token;
                refreshToken = refresh_token;

                done();
            });
    });

    it("Server should sends new token it generates when client wants to renew token", done => {
        return request(app.getHttpServer())
            .post("/auth/token/refresh")
            .send({ refresh_token: refreshToken })
            .expect(HttpStatus.CREATED)
            .end((err, res) => {
                if (err) return done(err);

                const {
                    access_token,
                    refresh_token,
                    expires_in,
                } = res.body as Record<string | number, string>;

                expect(typeof access_token).toBe("string");
                expect(typeof refresh_token).toBe("string");
                expect(typeof expires_in).toBe("number");

                done();
            });
    });

    it("Server should sends payload of token to client when client makes request 'auth/whoami' with user token", done => {
        return request(app.getHttpServer())
            .get("/auth/whoami")
            .auth(token, { type: "bearer" })
            .expect(HttpStatus.OK)
            .end((err, res) => {
                if (err) return done(err);

                const { id, email, flags } = res.body as Record<
                    string | number,
                    string
                >;

                expect(typeof id).toBe("string");
                expect(typeof email).toBe("string");
                expect(typeof flags).toBe("number");

                done();
            });
    });

    afterAll(async () => {
        await app.close();
    });
});
