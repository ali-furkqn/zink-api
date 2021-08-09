const axios = require("axios").default;

const getSecrets = async (baseUrl, appName, key, token) => {
    console.log("Fetching secrets...");

    const { data } = (
        await axios.get("https://"+[baseUrl,"v1", appName, "data", key].join("/"), {
            headers: {
                "x-vault-token": token,
            },
        })
    ).data;

    const secrets = data.data;
    console.log(`Successfully fetched ${Object.keys(secrets).length} secrets`);
    return secrets;
};

exports.default = getSecrets;
