import * as request from "supertest"
import { Test } from "@nestjs/testing"
import { AppModule } from "src/app.module"
import { INestApplication } from "@nestjs/common"
import { FastifyAdapter } from "@nestjs/platform-fastify"

describe("App (e2e)", () => {
    let app: INestApplication

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule],
        }).compile()

        app = moduleRef.createNestApplication(new FastifyAdapter())

        await app.init()
        await app
            .getHttpAdapter()
            .getInstance()
            .ready()
    })

    it("Server should response with ping time when the '/api/v1/status/' request from clients", done => {
        return request(app.getHttpServer())
            .get("/api/v1/status")
            .expect(200)
            .end((err, res) => {
                if (err) {
                    return done(err)
                }
                expect(typeof res.body).toBe("object")
                expect(typeof res.body.pong).toBe("number")
                done()
            })
    })

    afterAll(async () => {
        await app.close()
    })
})
