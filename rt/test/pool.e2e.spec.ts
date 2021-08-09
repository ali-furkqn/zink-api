import { TestingServerFactory } from "../src/common/testing";
import { SocketAdapter } from "../src/common/adapters";
import { EVENTS, MESSAGES } from "../src/common/constants";
import { PoolModule } from "../src/pool/pool.module";
import { Config } from "../src/config";
import * as cache from "memory-cache";

describe("Pool Namespace (e2e)", () => {
    let server: TestingServerFactory,
        clients: SocketIOClient.Socket[];

    beforeEach((done) => {
        server = new TestingServerFactory();
        [, clients] = server.create(PoolModule, new SocketAdapter(), {
            client: {
                instance: 2,
                namespace: "/pool",
                options: (i) => ({
                    query: {
                        access_token: Config.TESTERS[i]
                    }
                })
            },
        });
        done()
    });

    afterEach((done) => {
        cache.del("pool");
        cache.del("match.pool")
        server.close(done);
    });

    it("Server should accept Clients connection with authentication", (done) =>
        clients.forEach(client=>{
            client.on(EVENTS.ERROR,(e)=>expect(e).not.toEqual(MESSAGES.UNAUTHORIZATION))
            client.on("connect",done)
            client.emit(EVENTS.PING,true)
            client.on(EVENTS.PONG,done)
        })
    );
    describe("Add/Del User in Pool (Events)", () => {
        it("Server should add Client at Pool and emit the code '1' when the 'join.pool' event is emitted from Client", (done) => {
            clients[0].emit("join.pool", { type: "duel" });
            clients[0].on("join.pool", (msg: { code: number }) => {
                expect(msg.code).toEqual(1);
                done();
            });
        });
        it("Server should emit error when same Client try to joining the pool", (done) => {
            clients[0].emit("join.pool", { type: "duel" });
            clients[0].emit("join.pool", { type: "duel" });
            clients[0].on(
                EVENTS.ERROR,
                (ctx: { code: number; desc: string }) => {
                    expect(ctx.code).toEqual(400);
                    expect(ctx.desc).toEqual(MESSAGES.ALREADY_JOIN);
                    done();
                },
            );
        });
        it("When 2 different User joined the Pool, Server should create match and emits the match's data", (done) => {
            let i = 0;
            clients.forEach(client => {
                client.on(EVENTS.ERROR,(ctx:{code:number;desc:string})=>expect(ctx).not.toBeTruthy())
                client.on("join.pool",(ctx:{code:number;match})=>{
                    if (i == 1) {
                        expect(ctx.code).toEqual(1 << 1);
                        done();
                    }
                    if (ctx.code == 1 << 0) i += 1;
                })
                client.emit("join.pool", { type: "duel" });
            })
        });
        it("Server should kick Client at pool when Client want to leaving the pool with 'leave.pool'", (done) => {
            let i = 0
            clients[0].on("join.pool",()=>{
                const pool = cache.get("pool")
                expect(pool).toHaveLength(1)
                i += 1
            })
            clients[0].on("leave.pool",()=>{
                const pool = cache.get("pool")
                expect(pool).toHaveLength(0)
                expect(i).toEqual(1)
                done()
            })
            clients[0].emit("join.pool",{ type: "duel" })
            clients[0].emit("leave.pool",true)
        });
    });
});
