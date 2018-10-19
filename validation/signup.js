const validator =require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data){
    let errors = {};

    data.first_name = !isEmpty(data.first_name) ? data.first_name : '';
    data.last_name = !isEmpty(data.last_name) ? data.last_name : '';
    data.user_name = !isEmpty(data.user_name) ? data.user_name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    

    if (!validator.isLength(data.first_name, {min:2, max: 30 })){
        errors.first_name = 'Name must be between 2 and 30 characters';
    }
    if (validator.isEmpty(data.first_name)){
        errors.first_name = "First_Name is Required"
    }
    if (!validator.isLength(data.last_name, {min:2, max: 30 })){
        errors.last_name = 'Name must be between 2 and 30 characters';
    }
    if (validator.isEmpty(data.last_name)){
        errors.last_name = "Last_Name is Required"
    }
    if (!validator.isLength(data.user_name, {min:2, max: 30 })){
        errors.user_name = 'User Name must be between 2 and 30 characters';
    }
    if (validator.isEmpty(data.user_name)){
        errors.user_name = "User_Name is Required"
    }
    if (!validator.isEmail(data.email)) {
        errors.email = "Email is Invalid"
    }
    if (validator.isEmpty(data.email)){
        errors.email = "Email is Required"
    }
    if (validator.isEmpty(data.password)){
        errors.password = "Password is Required"
    }
    if (!validator.isLength(data.password, {min: 6, max: 30})){
        errors.password = "Password must be at least 6 Characters"
    }

    return {
        errors,
        isValid : isEmpty(errors)
    }
}
