import { superoak } from "https://deno.land/x/superoak@2.3.1/mod.ts";
import {app} from './app.js'
import {getHello, setHello} from  './services/helloService.js';
import {assertEquals, assertStringIncludes } from "https://deno.land/std@0.78.0/testing/asserts.ts";

Deno.test("GET to /api/hello returns no message initially ", async () => {
    const testClient = await superoak(app);
    await testClient.get('/api/hello')
        .expect({message: ''})
});
