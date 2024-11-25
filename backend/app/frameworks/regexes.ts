const emailRegex = /^[\w\_\-\.]{1,255}\@[\w\_\-\.]{1,255}\.[\w]{1,8}$/;
const mobileRegex = /^(?:06|\+36)(?:20|30|50|70)\s?[\d]{3}\s?[\d]{4}$/;
const phoneRegex = /^(?:06|\+36)[\d]{1,2}\s?[\d]{3}\s?[\d]{4}$/;

export default {emailRegex, mobileRegex, phoneRegex};

/*
    https://regex101.com/

    mobile 
    (06|\+36)(20|30|50|70)\s?[\d]{3}\s?[\d]{4}
        kőtőjleket ne rakjon úgy csináltuk

    van ez a non-capturing group ?: 
        tehát ahol ez van, hogy ?: azt nem fogja nekünk eltárolni és nem is szükséges, hogy ezt nekünk eltárolja!! 
    (?:06|\+36)(?:20|30|50|70)\s?[\d]{3}\s?[\d]{4}

    vagy 06 vagy +36-val kezdünk 
    /s? (space) - azt jelenti, hogy ez egy opcionális szóköz 
    [\d]{3} három darab digit 
*/