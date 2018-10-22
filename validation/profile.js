const validator =require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data){
    let errors = {};

    data.handle = !isEmpty(data.handle) ? data.handle : '';

    if(!validator.isLength(data.handle, {min: 2, max: 40 })) {
        errors.handle = 'handle need to between 2 and 4 characters'
    }
    if (validator.isEmpty(data.handle)){
        errors.handle = 'handle Fields is required';
    }

    return {
        errors,
        isValid : isEmpty(errors)
    }
}
