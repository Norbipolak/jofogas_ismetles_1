/*
    Ez a Controller lesz majd minden controller-nek az őse 
*/

import http, { HTTP } from "./HTTP.js";
import Validator from "./Validator.js";

class Controler {
    protected validator:Validator;
    protected http:HTTP; //ez a típus lesz, amit mi csináltunk 

    constructor() {
        this.validator = new Validator();
        this.http = http;
    }
}

export default Controler;