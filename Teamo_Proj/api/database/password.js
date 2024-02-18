const bcrypt = require('bcryptjs');

// 请确保您的SALT_ROUNDS常量在这里被正确设置
const SALT_ROUNDS = 10;

const testPassword = "123";
const testHash = bcrypt.hashSync(testPassword, SALT_ROUNDS);
const hardcodedHash = '$2b$10$cBIgGlUIDQyLF8zQtsAR..pWH0Qe.r6YCB7VI53puUi6jj6eIEbyq'; 
console.log('Test hash:', testHash);

// 因为bcrypt.compare是异步的，我们使用一个立即执行的异步函数来处理它
(async () => {
    const testCheck = await bcrypt.compare(testPassword, testHash);
    console.log('Test check result:', testCheck);

    const isHardcodedPasswordCorrect = await bcrypt.compare(testPassword, hardcodedHash);
    console.log('Hardcoded password match:', isHardcodedPasswordCorrect);
})();
