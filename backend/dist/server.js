"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const domains_1 = __importDefault(require("./routes/domains"));
const evaluations_1 = __importDefault(require("./routes/evaluations"));
const sales_1 = __importDefault(require("./routes/sales"));
const settings_1 = __importDefault(require("./routes/settings"));
const auth_1 = __importDefault(require("./routes/auth"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_1.default);
app.use('/api/domains', domains_1.default);
app.use('/api/evaluations', evaluations_1.default);
app.use('/api/sales', sales_1.default);
app.use('/api/settings', settings_1.default);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
