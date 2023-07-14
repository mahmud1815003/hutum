const main = {};

const allMail = [
    {
        regex: /([a-z]+)(([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3}))(@stud.kuet.ac.bd)/i,
        institution: 'KUET'
    },
    {
        regex: /^([0-9]{7})(@student.ruet.ac.bd)/i,
        institution: 'RUET'
    },
    {
        regex: /([a-z]{1})([0-9]{7})(@student.cuet.ac.bd)/i,
        institution: 'CUET'
    }
]

main.emailValidator = (email) => {
    for(let x of allMail){
        if(x.regex.test(email) == true){
            return x;
        }
    }
    return false;
}

module.exports = main;