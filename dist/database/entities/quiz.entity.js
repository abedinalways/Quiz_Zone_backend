"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quiz = exports.QuizStatus = exports.QuizDifficulty = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const quiz_result_entity_1 = require("./quiz-result.entity");
const quiz_category_entity_1 = require("./quiz-category.entity");
var QuizDifficulty;
(function (QuizDifficulty) {
    QuizDifficulty["EASY"] = "easy";
    QuizDifficulty["MEDIUM"] = "medium";
    QuizDifficulty["HARD"] = "hard";
})(QuizDifficulty || (exports.QuizDifficulty = QuizDifficulty = {}));
var QuizStatus;
(function (QuizStatus) {
    QuizStatus["DRAFT"] = "draft";
    QuizStatus["PUBLISHED"] = "published";
    QuizStatus["ARCHIVED"] = "archived";
})(QuizStatus || (exports.QuizStatus = QuizStatus = {}));
let Quiz = class Quiz {
    id;
    title;
    description;
    categoryId;
    category;
    difficulty;
    timeLimit;
    passingScore;
    questions;
    status;
    createdById;
    createdBy;
    totalAttempts;
    averageScore;
    results;
    createdAt;
    updatedAt;
};
exports.Quiz = Quiz;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Quiz.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Quiz.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Quiz.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Quiz.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => quiz_category_entity_1.QuizCategory, (category) => category.quizzes),
    (0, typeorm_1.JoinColumn)({ name: 'categoryId' }),
    __metadata("design:type", quiz_category_entity_1.QuizCategory)
], Quiz.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuizDifficulty,
        default: QuizDifficulty.MEDIUM,
    }),
    __metadata("design:type", String)
], Quiz.prototype, "difficulty", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 10 }),
    __metadata("design:type", Number)
], Quiz.prototype, "timeLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 40 }),
    __metadata("design:type", Number)
], Quiz.prototype, "passingScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], Quiz.prototype, "questions", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuizStatus,
        default: QuizStatus.DRAFT,
    }),
    __metadata("design:type", String)
], Quiz.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Quiz.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'createdById' }),
    __metadata("design:type", user_entity_1.User)
], Quiz.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Quiz.prototype, "totalAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], Quiz.prototype, "averageScore", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => quiz_result_entity_1.QuizResult, (result) => result.quiz),
    __metadata("design:type", Array)
], Quiz.prototype, "results", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Quiz.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Quiz.prototype, "updatedAt", void 0);
exports.Quiz = Quiz = __decorate([
    (0, typeorm_1.Entity)('quizzes')
], Quiz);
//# sourceMappingURL=quiz.entity.js.map