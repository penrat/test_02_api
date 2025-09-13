const { test, expect } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { userSchema } = require("../schema/user-schema");
const { Ajv } = require("ajv");
const ajv = new Ajv();

const schema = {
    type:"object",
    properties: {
        data: {
            type:"object",
            properties: {
                    id: {type:'integer'},
                    email: {type:'string'},
                    first_name: {type:'string'},
                    last_name: {type:'string'},
                    avatar: {type:'string'}
            },
            required: ["id","email","first_name","last_name","avatar"],
        },
        support: {
            type:"object",
            properties: {
                url: {type:'string'},
                text: {type:'string'} 
            },
            required: ["url","text"],
        }
    },
    required: ["data","support"],
}

const singleUser = {
    "data": {
        "id": 2,
        "email": "janet.weaver@reqres.in",
        "first_name": "Janet",
        "last_name": "Weaver",
        "avatar": "https://reqres.in/img/faces/2-image.jpg"
    },
    "support": {
        "url": "https://contentcaddy.io?utm_source=reqres&utm_medium=json&utm_campaign=referral",
        "text": "Tired of writing endless social media content? Let Content Caddy generate it for you."
    }
}

test.describe('Basic test 1',()=>{     
        test('basic test', async ({ request }) => {
            const response = await request.get('https://reqres.in/api/users/2');  // ใช้ baseURL จาก config
            expect(response.ok()).toBeTruthy();
            const body = await response.json();
            expect(body.data.id).toBe(2);
        });
});

test.describe('GET',()=>{
    test('Found single user',async({request})=>{
        const response = await request.get('https://reqres.in/api/users/2');
        // console.log(await  response.body());
        // console.log(await response.text());
        // console.log(await response.json());
        // const body = await response.json();
        // console.log(body);
        // expect(body).not.toBe({test:'test'});
        // expect(body).toBe({test:'test'});
        // console.log(JSON.parse(await response.text()));
        const status = response.status();
        console.log(status);
        expect(status).toBe(200);

        const header = response.headers();
        console.log(header['content-type']);
        console.log(header.server);
        expect(header['content-type']).toContain('application/json');
        expect(header['content-type']).toContain('charset=utf-8');
        expect(header.server).toBe('cloudflare');

        const body = await response.json();
        console.log(body);
        // expect(body).toHaveProperty("data");
        // expect(body).toHaveProperty("data.id");
        // expect(body).toHaveProperty("data.email");
        // expect(body).toHaveProperty("data.first_name");
        // expect(body).toHaveProperty("data.last_name");
        // expect(body).toHaveProperty("data.avatar");
        // const status = response.status();
        // console.log(header);
        const validate = ajv.compile(userSchema);
        // const valid = validate(singleUser)
        const valid = validate(body);
        if (!valid) console.log(validate.errors)
        else {
            console.log(valid);
        }    
        expect(valid).toBe(true);
    });

    test('Not found single user',async({request})=>{
        const response = await request.get('https://reqres.in/api/users/23',{
                headers: {
                'x-api-key': 'reqres-free-v1', // Add the API key
                }
        });
        const status = response.status();
        console.log(status);
        expect(status).toBe(404);
    });

    test('Not found single user1', async ({ request }) => {
        const response = await request.get('https://reqres.in/api/users/23', {
            headers: {
                'x-api-key': 'reqres-free-v1', // Add the API key
                'Accept': 'application/json',
            }
        });
        const status = response.status();
        console.log(status);
        expect(response.status()).toBe(404);
    });
});

test.describe('POST', () => {
    test('Create new user', async ({ request }) => {
        // Define test data
        const userData = {
            name: "Soju",
            job: "leader"
        };

        // Make the POST request
        const response = await request.post('https://reqres.in/api/users', {
            headers: {
                'x-api-key': 'reqres-free-v1',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: userData
        });

        // Log response for debugging
        const responseBody = await response.json();
        console.log('Response:', {
            status: response.status(),
            body: responseBody
        });

        // Assertions
        expect(response.status()).toBe(201);
        expect(responseBody).toHaveProperty('name', userData.name);
        expect(responseBody).toHaveProperty('job', userData.job);
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('createdAt');
    });
});

test.describe('PUT', () => {
    test('Update user with PUT', async ({ request }) => {
        // Define test data
        const userData = {
            name: "Soju",
            job: "zion resident"
        };

        // Make the PUT request to update user with ID 2
        const response = await request.put('https://reqres.in/api/users/2', {
            headers: {
                'x-api-key': 'reqres-free-v1',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: userData
        });

        // Log response for debugging
        const responseBody = await response.json();
        console.log('Update Response:', {
            status: response.status(),
            body: responseBody
        });

        // Assertions
        expect(response.status()).toBe(200); // PUT should return 200 (not 201)
        expect(responseBody).toHaveProperty('name', userData.name);
        expect(responseBody).toHaveProperty('job', userData.job);
        expect(responseBody).toHaveProperty('updatedAt');
    });
});

// GET right after PUT
test.describe('GET (after PUT)', () => {
    test('Verify user still retrievable after PUT', async ({ request }) => {
        const response = await request.get('https://reqres.in/api/users/2', {
            headers: { 'x-api-key': 'reqres-free-v1', 'Accept': 'application/json' }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('id', 2);
    });
});

test.describe('PATCH', () => {
    test('Partially update user data', async ({ request }) => {
        // Define partial update data
        const updateData = {
            job: "zion resident"  // Only updating the job field
        };

        // Make the PATCH request to partially update user with ID 2
        const response = await request.patch('https://reqres.in/api/users/2', {
            headers: {
                'x-api-key': 'reqres-free-v1',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: updateData
        });

        // Get and log response
        const responseBody = await response.json();
        console.log('Partial Update Response:', {
            status: response.status(),
            body: responseBody
        });

        // Assertions
        expect(response.status()).toBe(200);
        expect(responseBody).toHaveProperty('job', updateData.job);
        expect(responseBody).toHaveProperty('updatedAt');
        
        // Optional: Verify other fields weren't changed (if you have GET endpoint)
        // Note: Reqres.in is a mock API so it will return all fields regardless
    });
});

// GET right after PATCH
test.describe('GET (after PATCH)', () => {
    test('Verify user still retrievable after PATCH', async ({ request }) => {
        const response = await request.get('https://reqres.in/api/users/2', {
            headers: { 'x-api-key': 'reqres-free-v1', 'Accept': 'application/json' }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('id', 2);
    });
});

test.describe('DELETE', () => {
    test('Delete user', async ({ request }) => {
        // Make the DELETE request for user with ID 2
        const response = await request.delete('https://reqres.in/api/users/2', {
            headers: {
                'x-api-key': 'reqres-free-v1',
                'Accept': 'application/json'
            }
        });

        // Log response status for debugging
        console.log('Delete User Response Status:', response.status());

        // Assertions
        expect(response.status()).toBe(204); // No Content
        
        // For DELETE requests, typically there is no response body
        // If you want to verify the response is truly empty:
        try {
            const responseBody = await response.json();
            console.warn('Unexpected response body:', responseBody);
            expect(responseBody).toBeUndefined(); // This will fail if there's a body
        } catch (error) {
            // Expected - DELETE should have no response body
            expect(error.message).toContain('Unexpected end of JSON input');
        }
    });
});

// Additional GET tests placed after DELETE as requested
test.describe('GET (after DELETE)', () => {
    test('Fetch single user returns 200 and JSON', async ({ request }) => {
        const response = await request.get('https://reqres.in/api/users/2', {
            headers: {
                'x-api-key': 'reqres-free-v1',
                'Accept': 'application/json'
            }
        });

        expect(response.status()).toBe(200);
        const headers = response.headers();
        expect(headers['content-type']).toContain('application/json');

        const body = await response.json();
        expect(body).toHaveProperty('data');
        expect(body.data).toHaveProperty('id', 2);
    });

    test('Fetch non-existing user returns 404', async ({ request }) => {
        const response = await request.get('https://reqres.in/api/users/9999', {
            headers: {
                'x-api-key': 'reqres-free-v1',
                'Accept': 'application/json'
            }
        });
        expect(response.status()).toBe(404);
    });
});