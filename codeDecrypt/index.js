const fetch = require('node-fetch');
const rot13Cipher = require("rot13-cipher");


module.exports = async function (context, req) {
    const code = req.query.code;
    let codeCipher = await fetch(`https://b4d4ppl3s.herokuapp.com/api/code?code=${code}`,{
        method: 'GET',
    })

    const codeJson = await codeCipher.json();
    const codeRot = rot13Cipher(codeJson.secret);

    const keyResp = await fetch('https://b4d4ppl3s.herokuapp.com/api/unlock', {
        method:"POST",
        body: JSON.stringify({'code':codeRot}),
        headers: {'Content-Type': 'application/json'}
    });
    const key = await keyResp.json();


    context.res = {
        // status: 200, /* Defaults to 200 */
        body: key.key
    };
}