function catchFunc(err:any, cls:string, method:string):never {
    console.log(`${cls}.${method}`, err**);

    if(err.status) 
        throw err;

    throw {
        status: 503,
        message: "A szolgáltatás ideiglenes nem elérhető"
    };
}


export default catchFunc;

