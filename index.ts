const enum Types {
    Object,
    Array,
    Map,
    Set,
    Date
}

export const identity = (x: any) => {
    if (typeof x !== 'object') return x;

    const str = Object.prototype.toString.call(x);
    let out = '';

    switch (str) {
        case '[object Object]': {
            out += Types.Object;
            Object.keys(x).sort().forEach(key => {
                out += key;
                out += identity(key) + identity(x[key]);
            });
            break;
        }
        case '[object Array]': {
            out += Types.Array;
            out += String(x.map(identity).sort());
            break;
        }
        case '[object Set]': {
            out += Types.Set;
            out += String(Array.from(x).map(identity).sort());
            break;
        }
        case '[object Map]': {
            out += Types.Object;
            out += identity(Object.fromEntries(x.entries()));
            break;
        }
        case '[object Date]': {
            out += Types.Date;
            out += +x;
            break;
        }
    }

    return out;
};
