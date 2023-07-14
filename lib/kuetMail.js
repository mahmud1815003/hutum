const main = {};

main.kuetMail = (emailer) => {
    const regex = /([a-z]+)(([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3}))(@stud.kuet.ac.bd)/i
    const dept = {
      '01': "CE",
      '03': "EEE",
      '05': "ME",
      '07': "CSE",
      '09': "ECE",
      '11': "IEM",
      '13': "ESE",
      '15': "BME",
      '17': "URP",
      '19': "LE",
      '21': "TE",
      '23': "BECM",
      '25': "ARCH",
      '27': "MSE",
      '29': "ChE",
      '31': "MTE"

    }
    const name = cap(emailer.replace(/(([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3}))(@stud.kuet.ac.bd)/i, ''));
    const roll = emailer.match(/([0-9]{2})(25|23|15|29|01|07|09|03|13|11|19|05|27|31|21|17)([0-9]{3})/i);
    const department = dept[roll[2]];
    return {
        name,
        roll: roll[0],
        department
    }
}

function cap(str){
    return str.slice(0,1).toUpperCase()+str.slice(1); 
}


module.exports = main;