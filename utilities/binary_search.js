function binary_search(ara,data, isObj, para){
    let s = 0; 
    let e = ara.length-1;
    if(isObj === true){
        while(s<=e){
            let mid = Math.floor((s+e)/2);
            if(ara[mid][para] === data){
                return mid;
            }else if(ara[mid][para] < data){
                s = mid+1;
            }else{
                e = mid-1
            }
        }
        return false;
    }else{
        while(s<=e){
            let mid = Math.floor((s+e)/2);
            if(ara[mid] === data){
                return mid;
            }else if(ara[mid] < data){
                s = mid+1;
            }else{
                e = mid-1
            }
        }
        return false;
    }
}

module.exports = {
    binary_search,
}