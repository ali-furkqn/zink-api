import { AppModule } from "../src/module";
import { TestingServerFactory } from "../src/common/testing";
import { SocketAdapter } from "../src/common/adapters";
import { EVENTS } from "../src/common/constants";

describe("Application (e2e)", () => {
    let server: TestingServerFactory, client: SocketIOClient.Socket[];
    
    beforeEach((done) => {
        server = new TestingServerFactory();
        [, client] = server.create(AppModule, new SocketAdapter());
        done();
    });

    it(`Server should response with the '${EVENTS.PONG}' event when the '${EVENTS.PING}' event is emited from clients`, (done) => {
        client[0].emit(EVENTS.PING, true);
        client[0].on(EVENTS.PONG, (data) => {
            expect(data).toBeTruthy();
            done();
        });
    });

    afterEach((done) => {
        server.close(done);
    });
});
