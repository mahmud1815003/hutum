function timeSpilter(allTime, EnglishDate, ArbiDate) {
    const x = allTime.replace(/AM/g, '');
    const y = x.replace(/PM/g, '').trim();
    const namaz = y.split(' ');
    const english = EnglishDate.replace(ArbiDate, '');
    return { namaz, english };
}

module.exports = {
    timeSpilter,
}