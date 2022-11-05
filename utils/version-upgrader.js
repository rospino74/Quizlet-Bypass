const { writeFileSync, readFileSync } = require('fs');

// Read the package.json and updates.json files
const packageJson = JSON.parse(readFileSync('package.json'));
const updatesJson = JSON.parse(readFileSync('public/updates.json'));

// Read the current version from package.json
const currentVersion = packageJson.version;

// Parse the version into its major, minor, and patch components
let [major, minor, patch] = currentVersion.split('.').map(Number);

// Determine which component to upgrade based on the argument
const upgradeType = process.argv[2];
switch (upgradeType) {
    case 'PATCH':
        patch++;
        break;
    case 'MINOR':
        minor++;
        patch = 0;
        break;
    case 'MAJOR':
        major++;
        minor = 0;
        patch = 0;
        break;
    default:
        console.error('Invalid upgrade type. Must be PATCH, MINOR, or MAJOR.');
        process.exit(1);
}
const newVersion = `${major}.${minor}.${patch}`;

// Update the version in package.json with the new version
packageJson.version = newVersion;
writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

// Update the version in updates.json with the new version
const updates = updatesJson.addons["quizletbypass@rospino74.github.io"].updates;
const oldUpdate = updates[updates.length - 1];
const newUpdate = {
    ...oldUpdate,
    version: newVersion,
    update_link: oldUpdate.update_link.replace(currentVersion, newVersion),
};

updates.push(newUpdate);
writeFileSync('public/updates.json', JSON.stringify(updatesJson, null, 2));

// Log the new version
console.log(newVersion);