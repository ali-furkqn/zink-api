import { TestingServerFactory } from "../src/common/testing"
import { GameModule } from "../src/game/game.module";
import { SocketAdapter } from "../src/common/adapters";
import { Config } from "../src/config";
import * as cache from "memory-cache"
import { api } from "../src/common/api";

describe("Game Namespace (e2e)", () => {
    let server: TestingServerFactory,
        users: {[prop:string]:{id:string;username:string;}}[],
        clients: SocketIOClient.Socket[];
    
    beforeEach(async (done)=>{
        server = new TestingServerFactory();
        [,clients] = server.create(GameModule, new SocketAdapter(), {
            client: {
                instance: 2,
                namespace: "/game",
                options: (i) => ({
                    query: {
                        access_token: Config.TESTERS[i]
                    }
                })
            }
        })
        for(let i=0;i<2;i++) {
            const user = (await api.get("/users/@me",{
                headers: {
                    authorization: Config.TESTERS[i]
                }
            })).data
            users.push(user)
        }
        done()
    })
    
    afterEach((done)=>{
        cache.del("match.pool")
        server.close(done)
    })

    describe("Duel Game", () => {
        // Duel Game Tests
    })

    describe("Catch Game", () => {
        // Catch Game Tests
    })

    describe("Fast Finger Game", () => {
        // Fast Finger Tests
    })

    describe("Math Game", () => {
        // Math Game Tests
    })
})
