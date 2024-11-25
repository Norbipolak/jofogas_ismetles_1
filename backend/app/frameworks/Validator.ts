/*
    Ez az osztály le tud ellenőrizni nagyon sokféle formátumu bemeneti értéket 
    Elöször is kell egy value, amit le kell majd elenőriznie 
*/
import {ruleTypes, valueName} from "../models/types.js";
import nullOrUndefined from "./nullOrUndefined.js";

class Validator {
    private _valueName:valueName;
    private rules:Record<string, any>[]

    constructor() {
        this.init();
    }

    public init() {
        this._valueName = {name: "", value: ""};
        this.rules = [];
    }

    public setValue(name:string, value:any) {
        this._valueName = {
            name,
            value
        };
    }

    //ez mindig vissza fog adni egy Validator-t, ugyanúgy mint az SqlQueryBuilder-nél, hogy tudjunk chain-elni 
    public required(value:boolean):Validator {
        this.rules.push({
            type: ruleTypes.required,
            value:value
        });
        return this;
    }


    public minLength(length:number):Validator {
        this.rules.push({
            types: ruleTypes.minLength,
            value: length
        });
        return this;
    }

    public maxLength(length:number):Validator {
        this.rules.push({
            name: ruleTypes.maxLength, 
            value: length
        })
        return this;
    }
    public minValue(min:number):Validator {
        this.rules.push({
            type: ruleTypes.minValue, 
            value: min
        })
        return this;
    }

    public maxValue(max:number):Validator {
        this.rules.push({
            type: ruleTypes.maxValue, 
            value: max
        })
        return this;
    }

    public between(min:number, max:number):Validator {
        this.rules.push({
            type: ruleTypes.between, 
            min: min, 
            max: max 
        })
        return this;
    }

    public betweenLength(min:number, max:number):Validator {
        this.rules.push({
            type: ruleTypes.betweenLength, 
            min: min, 
            max: max 
        })
        return this;
    }

    public isString():Validator {
        this.rules.push({
            type: ruleTypes.isString, 
        })
        return this;
    }

    public isMobile():Validator {
        this.rules.push({
            type: ruleTypes.isMobile, 
        })
        return this;
    }

    public isPhone():Validator {
        this.rules.push({
            type: ruleTypes.isPhone, 
        })
        return this;
    }

    public isEmail():Validator {
        this.rules.push({
            type: ruleTypes.isEmail, 
        })
        return this;
    }

    public isDate():Validator {
        this.rules.push({
            type: ruleTypes.isDate, 
        })
        return this;
    }

    public isTime():Validator {
        this.rules.push({
            type: ruleTypes.isTime, 
        })
        return this;
    }

    public isDateTime():Validator {
        this.rules.push({
            type: ruleTypes.isDateTime, 
        })
        return this;
    }
    
    public regex(regex:RegExp):Validator {
        this.rules.push({
            type: ruleTypes.regex, 
            regex: regex
        })
        return this;
    }

    public execute() {
        for(const rule of this.rules) {
            const errors:string[] = [];

            if(rule.type === ruleTypes.maxLength
                && (typeof this._valueName.value !== "string" //Ellenőrzi, hogy string típusú
                || this._valueName.value.length > rule.value) //Ellőnőrzi, hogy a hossza nagyobb-e, mint a megadott érték 
            ) {
                errors.push(`A következő mező maximális hossza ${rule.value} karakter lehet: ${this._valueName.name}`)
            }

                if(rule.type === ruleTypes.minLength
                    && (typeof this._valueName.value !== "string" //Ellenőrzi, hogy string típusú
                    || this._valueName.value.length < rule.value) //Ellőnőrzi, hogy a hossza nagyobb-e, mint a megadott érték 
                ) {
                    errors.push(`A következő mező minimális hossza ${rule.value} karakter lehet: ${this._valueName.name}`)
                }

                // this._valueName = {value: "", name: ""};
                // this.rules = [];
                this.init(); //fontos, hogy a cikluson kivül legyen meghívva!!!! 

                if(rule.type === ruleTypes.required && rule.value && 
                    (
                    // this._valueName.value === undefined ||
                    // this._valueName.value === null ||
                    nullOrUndefined(this._valueName.value) ||
                    this._valueName.value.toString().length === 0
                    )
                ) {
                    break;
                }

                if(rule.type === ruleTypes.minValue
                && this._valueName.value < rule.value) {
                    errors.push(`A következő mező értéke minimum ${rule.value} kell, hogy legyen ${this._valueName.value}`)
                }

                if(rule.type === ruleTypes.maxValue
                && this._valueName.value > rule.value) {
                    errors.push(`A következő mező értéke maximum ${rule.value} lehet ${this._valueName.value}`)
                }

                if(rule.type === ruleTypes.between
                && (
                    nullOrUndefined(this._valueName.value) ||
                    this._valueName.value > rule.max || 
                    this._valueName.value < rule.min)) {
                    errors.push(`A következő mező értékének ${rule.min} és ${rule.max} között kell lennie ${this._valueName.value}`)
                }

                if(rule.type === ruleTypes.betweenLength
                && (
                    nullOrUndefined(this._valueName.value) ||
                    this._valueName.value.toString().length > rule.max ||
                    this._valueName.value.toString().length < rule.min)) {
                    errors.push(`A következő mező értékének ${rule.min} és ${rule.max} között kell lennie ${this._valueName.value}`)
                }

                return errors;
                
        }
    }
    
}

export default Validator;