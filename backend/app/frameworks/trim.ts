function trim(obj:Record<string, any>):Record<string, any> {
    for(const key in obj) {
        if(typeof obj[key] === "string")
            obj[key] = obj[key].trim();   
    }

    return obj;
}

export default trim;

