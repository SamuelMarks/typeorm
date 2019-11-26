import * as tslib_1 from "tslib";
import { CockroachDriver } from "../driver/cockroachdb/CockroachDriver";
import { QueryBuilder } from "./QueryBuilder";
import { SqlServerDriver } from "../driver/sqlserver/SqlServerDriver";
import { PostgresDriver } from "../driver/postgres/PostgresDriver";
import { MysqlDriver } from "../driver/mysql/MysqlDriver";
import { RandomGenerator } from "../util/RandomGenerator";
import { InsertResult } from "./result/InsertResult";
import { ReturningStatementNotSupportedError } from "../error/ReturningStatementNotSupportedError";
import { InsertValuesMissingError } from "../error/InsertValuesMissingError";
import { ReturningResultsEntityUpdator } from "./ReturningResultsEntityUpdator";
import { AbstractSqliteDriver } from "../driver/sqlite-abstract/AbstractSqliteDriver";
import { SqljsDriver } from "../driver/sqljs/SqljsDriver";
import { BroadcasterResult } from "../subscriber/BroadcasterResult";
import { EntitySchema } from "../";
import { OracleDriver } from "../driver/oracle/OracleDriver";
import { AuroraDataApiDriver } from "../driver/aurora-data-api/AuroraDataApiDriver";
/**
 * Allows to build complex sql queries in a fashion way and execute those queries.
 */
var InsertQueryBuilder = /** @class */ (function (_super) {
    tslib_1.__extends(InsertQueryBuilder, _super);
    function InsertQueryBuilder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // -------------------------------------------------------------------------
    // Public Implemented Methods
    // -------------------------------------------------------------------------
    /**
     * Gets generated sql query without parameters being replaced.
     */
    InsertQueryBuilder.prototype.getQuery = function () {
        var sql = this.createInsertExpression();
        return sql.trim();
    };
    /**
     * Executes sql generated by query builder and returns raw database results.
     */
    InsertQueryBuilder.prototype.execute = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var queryRunner, transactionStartedByUs, valueSets, broadcastResult_1, returningResultsEntityUpdator, _a, sql, parameters, insertResult, _b, broadcastResult_2, error_1, rollbackError_1;
            var _this = this;
            return tslib_1.__generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        queryRunner = this.obtainQueryRunner();
                        transactionStartedByUs = false;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 13, 18, 23]);
                        if (!(this.expressionMap.useTransaction === true && queryRunner.isTransactionActive === false)) return [3 /*break*/, 3];
                        return [4 /*yield*/, queryRunner.startTransaction()];
                    case 2:
                        _c.sent();
                        transactionStartedByUs = true;
                        _c.label = 3;
                    case 3:
                        valueSets = this.getValueSets();
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 5];
                        broadcastResult_1 = new BroadcasterResult();
                        valueSets.forEach(function (valueSet) {
                            queryRunner.broadcaster.broadcastBeforeInsertEvent(broadcastResult_1, _this.expressionMap.mainAlias.metadata, valueSet);
                        });
                        if (!(broadcastResult_1.promises.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, Promise.all(broadcastResult_1.promises)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5:
                        returningResultsEntityUpdator = new ReturningResultsEntityUpdator(queryRunner, this.expressionMap);
                        if (this.expressionMap.updateEntity === true && this.expressionMap.mainAlias.hasMetadata) {
                            this.expressionMap.extraReturningColumns = returningResultsEntityUpdator.getInsertionReturningColumns();
                        }
                        _a = tslib_1.__read(this.getQueryAndParameters(), 2), sql = _a[0], parameters = _a[1];
                        insertResult = new InsertResult();
                        // console.time(".query execution by database");
                        _b = insertResult;
                        return [4 /*yield*/, queryRunner.query(sql, parameters)];
                    case 6:
                        // console.time(".query execution by database");
                        _b.raw = _c.sent();
                        if (!(this.expressionMap.updateEntity === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 8];
                        // console.time(".updating entity");
                        return [4 /*yield*/, returningResultsEntityUpdator.insert(insertResult, valueSets)];
                    case 7:
                        // console.time(".updating entity");
                        _c.sent();
                        _c.label = 8;
                    case 8:
                        if (!(this.expressionMap.callListeners === true && this.expressionMap.mainAlias.hasMetadata)) return [3 /*break*/, 10];
                        broadcastResult_2 = new BroadcasterResult();
                        valueSets.forEach(function (valueSet) {
                            queryRunner.broadcaster.broadcastAfterInsertEvent(broadcastResult_2, _this.expressionMap.mainAlias.metadata, valueSet);
                        });
                        if (!(broadcastResult_2.promises.length > 0)) return [3 /*break*/, 10];
                        return [4 /*yield*/, Promise.all(broadcastResult_2.promises)];
                    case 9:
                        _c.sent();
                        _c.label = 10;
                    case 10:
                        if (!transactionStartedByUs) return [3 /*break*/, 12];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 11:
                        _c.sent();
                        _c.label = 12;
                    case 12: 
                    // console.timeEnd(".commit");
                    return [2 /*return*/, insertResult];
                    case 13:
                        error_1 = _c.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 17];
                        _c.label = 14;
                    case 14:
                        _c.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 15:
                        _c.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        rollbackError_1 = _c.sent();
                        return [3 /*break*/, 17];
                    case 17: throw error_1;
                    case 18:
                        if (!(queryRunner !== this.queryRunner)) return [3 /*break*/, 20];
                        return [4 /*yield*/, queryRunner.release()];
                    case 19:
                        _c.sent();
                        _c.label = 20;
                    case 20:
                        if (!(this.connection.driver instanceof SqljsDriver && !queryRunner.isTransactionActive)) return [3 /*break*/, 22];
                        return [4 /*yield*/, this.connection.driver.autoSave()];
                    case 21:
                        _c.sent();
                        _c.label = 22;
                    case 22: return [7 /*endfinally*/];
                    case 23: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Specifies INTO which entity's table insertion will be executed.
     */
    InsertQueryBuilder.prototype.into = function (entityTarget, columns) {
        entityTarget = entityTarget instanceof EntitySchema ? entityTarget.options.name : entityTarget;
        var mainAlias = this.createFromAlias(entityTarget);
        this.expressionMap.setMainAlias(mainAlias);
        this.expressionMap.insertColumns = columns || [];
        return this;
    };
    /**
     * Values needs to be inserted into table.
     */
    InsertQueryBuilder.prototype.values = function (values) {
        this.expressionMap.valuesSet = values;
        return this;
    };
    /**
     * Optional returning/output clause.
     */
    InsertQueryBuilder.prototype.output = function (output) {
        return this.returning(output);
    };
    /**
     * Optional returning/output clause.
     */
    InsertQueryBuilder.prototype.returning = function (returning) {
        // not all databases support returning/output cause
        if (!this.connection.driver.isReturningSqlSupported())
            throw new ReturningStatementNotSupportedError();
        this.expressionMap.returning = returning;
        return this;
    };
    /**
     * Indicates if entity must be updated after insertion operations.
     * This may produce extra query or use RETURNING / OUTPUT statement (depend on database).
     * Enabled by default.
     */
    InsertQueryBuilder.prototype.updateEntity = function (enabled) {
        this.expressionMap.updateEntity = enabled;
        return this;
    };
    /**
     * Adds additional ON CONFLICT statement supported in postgres and cockroach.
     */
    InsertQueryBuilder.prototype.onConflict = function (statement) {
        this.expressionMap.onConflict = statement;
        return this;
    };
    /**
     * Adds additional ignore statement supported in databases.
     */
    InsertQueryBuilder.prototype.orIgnore = function (statement) {
        if (statement === void 0) { statement = true; }
        this.expressionMap.onIgnore = statement;
        return this;
    };
    /**
     * Adds additional update statement supported in databases.
     */
    InsertQueryBuilder.prototype.orUpdate = function (statement) {
        this.expressionMap.onUpdate = {};
        if (statement && statement.conflict_target instanceof Array)
            this.expressionMap.onUpdate.conflict = " ( " + statement.conflict_target.join(", ") + " ) ";
        if (statement && typeof statement.conflict_target === "string")
            this.expressionMap.onUpdate.conflict = " ON CONSTRAINT " + statement.conflict_target + " ";
        if (statement && statement.columns instanceof Array)
            this.expressionMap.onUpdate.columns = statement.columns.map(function (column) { return column + " = :" + column; }).join(", ");
        if (statement && statement.overwrite instanceof Array) {
            if (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver) {
                this.expressionMap.onUpdate.overwrite = statement.overwrite.map(function (column) { return column + " = VALUES(" + column + ")"; }).join(", ");
            }
            else if (this.connection.driver instanceof PostgresDriver || this.connection.driver instanceof AbstractSqliteDriver || this.connection.driver instanceof CockroachDriver) {
                this.expressionMap.onUpdate.overwrite = statement.overwrite.map(function (column) { return column + " = EXCLUDED." + column; }).join(", ");
            }
        }
        return this;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates INSERT express used to perform insert query.
     */
    InsertQueryBuilder.prototype.createInsertExpression = function () {
        var tableName = this.getTableName(this.getMainTableName());
        var valuesExpression = this.createValuesExpression(); // its important to get values before returning expression because oracle rely on native parameters and ordering of them is important
        var returningExpression = this.createReturningExpression();
        var columnsExpression = this.createColumnNamesExpression();
        var query = "INSERT ";
        if (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver) {
            query += "" + (this.expressionMap.onIgnore ? " IGNORE " : "");
        }
        query += "INTO " + tableName;
        // add columns expression
        if (columnsExpression) {
            query += "(" + columnsExpression + ")";
        }
        else {
            if (!valuesExpression && (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver)) // special syntax for mysql DEFAULT VALUES insertion
                query += "()";
        }
        // add OUTPUT expression
        if (returningExpression && this.connection.driver instanceof SqlServerDriver) {
            query += " OUTPUT " + returningExpression;
        }
        // add VALUES expression
        if (valuesExpression) {
            query += " VALUES " + valuesExpression;
        }
        else {
            if (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver) { // special syntax for mysql DEFAULT VALUES insertion
                query += " VALUES ()";
            }
            else {
                query += " DEFAULT VALUES";
            }
        }
        if (this.connection.driver instanceof PostgresDriver || this.connection.driver instanceof AbstractSqliteDriver || this.connection.driver instanceof CockroachDriver) {
            query += "" + (this.expressionMap.onIgnore ? " ON CONFLICT DO NOTHING " : "");
            query += "" + (this.expressionMap.onConflict ? " ON CONFLICT " + this.expressionMap.onConflict : "");
            if (this.expressionMap.onUpdate) {
                var _a = this.expressionMap.onUpdate, overwrite = _a.overwrite, columns = _a.columns, conflict = _a.conflict;
                query += "" + (columns ? " ON CONFLICT " + conflict + " DO UPDATE SET " + columns : "");
                query += "" + (overwrite ? " ON CONFLICT " + conflict + " DO UPDATE SET " + overwrite : "");
            }
        }
        else if (this.connection.driver instanceof MysqlDriver || this.connection.driver instanceof AuroraDataApiDriver) {
            if (this.expressionMap.onUpdate) {
                var _b = this.expressionMap.onUpdate, overwrite = _b.overwrite, columns = _b.columns;
                query += "" + (columns ? " ON DUPLICATE KEY UPDATE " + columns : "");
                query += "" + (overwrite ? " ON DUPLICATE KEY UPDATE " + overwrite : "");
            }
        }
        // add RETURNING expression
        if (returningExpression && (this.connection.driver instanceof PostgresDriver || this.connection.driver instanceof OracleDriver || this.connection.driver instanceof CockroachDriver)) {
            query += " RETURNING " + returningExpression;
        }
        return query;
    };
    /**
     * Gets list of columns where values must be inserted to.
     */
    InsertQueryBuilder.prototype.getInsertedColumns = function () {
        var _this = this;
        if (!this.expressionMap.mainAlias.hasMetadata)
            return [];
        return this.expressionMap.mainAlias.metadata.columns.filter(function (column) {
            // if user specified list of columns he wants to insert to, then we filter only them
            if (_this.expressionMap.insertColumns.length)
                return _this.expressionMap.insertColumns.indexOf(column.propertyPath) !== -1;
            // skip columns the user doesn't want included by default
            if (!column.isInsert) {
                return false;
            }
            // if user did not specified such list then return all columns except auto-increment one
            // for Oracle we return auto-increment column as well because Oracle does not support DEFAULT VALUES expression
            if (column.isGenerated && column.generationStrategy === "increment"
                && !(_this.connection.driver instanceof OracleDriver)
                && !(_this.connection.driver instanceof AbstractSqliteDriver)
                && !(_this.connection.driver instanceof MysqlDriver)
                && !(_this.connection.driver instanceof AuroraDataApiDriver))
                return false;
            return true;
        });
    };
    /**
     * Creates a columns string where values must be inserted to for INSERT INTO expression.
     */
    InsertQueryBuilder.prototype.createColumnNamesExpression = function () {
        var _this = this;
        var columns = this.getInsertedColumns();
        if (columns.length > 0)
            return columns.map(function (column) { return _this.escape(column.databaseName); }).join(", ");
        // in the case if there are no insert columns specified and table without metadata used
        // we get columns from the inserted value map, in the case if only one inserted map is specified
        if (!this.expressionMap.mainAlias.hasMetadata && !this.expressionMap.insertColumns.length) {
            var valueSets = this.getValueSets();
            if (valueSets.length === 1)
                return Object.keys(valueSets[0]).map(function (columnName) { return _this.escape(columnName); }).join(", ");
        }
        // get a table name and all column database names
        return this.expressionMap.insertColumns.map(function (columnName) { return _this.escape(columnName); }).join(", ");
    };
    /**
     * Creates list of values needs to be inserted in the VALUES expression.
     */
    InsertQueryBuilder.prototype.createValuesExpression = function () {
        var _this = this;
        var valueSets = this.getValueSets();
        var columns = this.getInsertedColumns();
        // if column metadatas are given then apply all necessary operations with values
        if (columns.length > 0) {
            var expression_1 = "";
            var parametersCount_1 = Object.keys(this.expressionMap.nativeParameters).length;
            valueSets.forEach(function (valueSet, valueSetIndex) {
                columns.forEach(function (column, columnIndex) {
                    if (columnIndex === 0) {
                        expression_1 += "(";
                    }
                    var paramName = "i" + valueSetIndex + "_" + column.databaseName;
                    // extract real value from the entity
                    var value = column.getEntityValue(valueSet);
                    // if column is relational and value is an object then get real referenced column value from this object
                    // for example column value is { question: { id: 1 } }, value will be equal to { id: 1 }
                    // and we extract "1" from this object
                    /*if (column.referencedColumn && value instanceof Object && !(value instanceof Function)) { // todo: check if we still need it since getEntityValue already has similar code
                        value = column.referencedColumn.getEntityValue(value);
                    }*/
                    // make sure our value is normalized by a driver
                    value = _this.connection.driver.preparePersistentValue(value, column);
                    // newly inserted entities always have a version equal to 1 (first version)
                    if (column.isVersion) {
                        expression_1 += "1";
                        // } else if (column.isNestedSetLeft) {
                        //     const tableName = this.connection.driver.escape(column.entityMetadata.tablePath);
                        //     const rightColumnName = this.connection.driver.escape(column.entityMetadata.nestedSetRightColumn!.databaseName);
                        //     const subQuery = `(SELECT c.max + 1 FROM (SELECT MAX(${rightColumnName}) as max from ${tableName}) c)`;
                        //     expression += subQuery;
                        //
                        // } else if (column.isNestedSetRight) {
                        //     const tableName = this.connection.driver.escape(column.entityMetadata.tablePath);
                        //     const rightColumnName = this.connection.driver.escape(column.entityMetadata.nestedSetRightColumn!.databaseName);
                        //     const subQuery = `(SELECT c.max + 2 FROM (SELECT MAX(${rightColumnName}) as max from ${tableName}) c)`;
                        //     expression += subQuery;
                    }
                    else if (column.isDiscriminator) {
                        _this.expressionMap.nativeParameters["discriminator_value_" + parametersCount_1] = _this.expressionMap.mainAlias.metadata.discriminatorValue;
                        expression_1 += _this.connection.driver.createParameter("discriminator_value_" + parametersCount_1, parametersCount_1);
                        parametersCount_1++;
                        // return "1";
                        // for create and update dates we insert current date
                        // no, we don't do it because this constant is already in "default" value of the column
                        // with extended timestamp functionality, like CURRENT_TIMESTAMP(6) for example
                        // } else if (column.isCreateDate || column.isUpdateDate) {
                        //     return "CURRENT_TIMESTAMP";
                        // if column is generated uuid and database does not support its generation and custom generated value was not provided by a user - we generate a new uuid value for insertion
                    }
                    else if (column.isGenerated && column.generationStrategy === "uuid" && !_this.connection.driver.isUUIDGenerationSupported() && value === undefined) {
                        var paramName_1 = "uuid_" + column.databaseName + valueSetIndex;
                        value = RandomGenerator.uuid4();
                        _this.expressionMap.nativeParameters[paramName_1] = value;
                        expression_1 += _this.connection.driver.createParameter(paramName_1, parametersCount_1);
                        parametersCount_1++;
                        // if value for this column was not provided then insert default value
                    }
                    else if (value === undefined) {
                        if (_this.connection.driver instanceof AbstractSqliteDriver) { // unfortunately sqlite does not support DEFAULT expression in INSERT queries
                            if (column.default !== undefined) { // try to use default defined in the column
                                expression_1 += _this.connection.driver.normalizeDefault(column);
                            }
                            else {
                                expression_1 += "NULL"; // otherwise simply use NULL and pray if column is nullable
                            }
                        }
                        else {
                            expression_1 += "DEFAULT";
                        }
                        // support for SQL expressions in queries
                    }
                    else if (value instanceof Function) {
                        expression_1 += value();
                        // just any other regular value
                    }
                    else {
                        if (_this.connection.driver instanceof SqlServerDriver)
                            value = _this.connection.driver.parametrizeValue(column, value);
                        // we need to store array values in a special class to make sure parameter replacement will work correctly
                        // if (value instanceof Array)
                        //     value = new ArrayParameter(value);
                        _this.expressionMap.nativeParameters[paramName] = value;
                        if ((_this.connection.driver instanceof MysqlDriver || _this.connection.driver instanceof AuroraDataApiDriver) && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            var useLegacy = _this.connection.driver.options.legacySpatialSupport;
                            var geomFromText = useLegacy ? "GeomFromText" : "ST_GeomFromText";
                            if (column.srid != null) {
                                expression_1 += geomFromText + "(" + _this.connection.driver.createParameter(paramName, parametersCount_1) + ", " + column.srid + ")";
                            }
                            else {
                                expression_1 += geomFromText + "(" + _this.connection.driver.createParameter(paramName, parametersCount_1) + ")";
                            }
                        }
                        else if (_this.connection.driver instanceof PostgresDriver && _this.connection.driver.spatialTypes.indexOf(column.type) !== -1) {
                            if (column.srid != null) {
                                expression_1 += "ST_SetSRID(ST_GeomFromGeoJSON(" + _this.connection.driver.createParameter(paramName, parametersCount_1) + "), " + column.srid + ")::" + column.type;
                            }
                            else {
                                expression_1 += "ST_GeomFromGeoJSON(" + _this.connection.driver.createParameter(paramName, parametersCount_1) + ")::" + column.type;
                            }
                        }
                        else {
                            expression_1 += _this.connection.driver.createParameter(paramName, parametersCount_1);
                        }
                        parametersCount_1++;
                    }
                    if (columnIndex === columns.length - 1) {
                        if (valueSetIndex === valueSets.length - 1) {
                            expression_1 += ")";
                        }
                        else {
                            expression_1 += "), ";
                        }
                    }
                    else {
                        expression_1 += ", ";
                    }
                });
            });
            if (expression_1 === "()")
                return "";
            return expression_1;
        }
        else { // for tables without metadata
            // get values needs to be inserted
            var expression_2 = "";
            var parametersCount_2 = Object.keys(this.expressionMap.nativeParameters).length;
            valueSets.forEach(function (valueSet, insertionIndex) {
                var columns = Object.keys(valueSet);
                columns.forEach(function (columnName, columnIndex) {
                    if (columnIndex === 0) {
                        expression_2 += "(";
                    }
                    var paramName = "i" + insertionIndex + "_" + columnName;
                    var value = valueSet[columnName];
                    // support for SQL expressions in queries
                    if (value instanceof Function) {
                        expression_2 += value();
                        // if value for this column was not provided then insert default value
                    }
                    else if (value === undefined) {
                        if (_this.connection.driver instanceof AbstractSqliteDriver) {
                            expression_2 += "NULL";
                        }
                        else {
                            expression_2 += "DEFAULT";
                        }
                        // just any other regular value
                    }
                    else {
                        _this.expressionMap.nativeParameters[paramName] = value;
                        expression_2 += _this.connection.driver.createParameter(paramName, parametersCount_2);
                        parametersCount_2++;
                    }
                    if (columnIndex === Object.keys(valueSet).length - 1) {
                        if (insertionIndex === valueSets.length - 1) {
                            expression_2 += ")";
                        }
                        else {
                            expression_2 += "), ";
                        }
                    }
                    else {
                        expression_2 += ", ";
                    }
                });
            });
            if (expression_2 === "()")
                return "";
            return expression_2;
        }
    };
    /**
     * Gets array of values need to be inserted into the target table.
     */
    InsertQueryBuilder.prototype.getValueSets = function () {
        if (this.expressionMap.valuesSet instanceof Array && this.expressionMap.valuesSet.length > 0)
            return this.expressionMap.valuesSet;
        if (this.expressionMap.valuesSet instanceof Object)
            return [this.expressionMap.valuesSet];
        throw new InsertValuesMissingError();
    };
    return InsertQueryBuilder;
}(QueryBuilder));
export { InsertQueryBuilder };

//# sourceMappingURL=InsertQueryBuilder.js.map
