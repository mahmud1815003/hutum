const main = {};

main.institution = (email) => {
    const varsity = ['kuet', 'ruet', 'cuet'];
    for(let i = 0; i < varsity.length; i++){
        if(new RegExp(varsity[i], 'i').test(email)){
            return varsity[i].toString().toUpperCase();
        }
    }
    return false;
}

module.exports = main;