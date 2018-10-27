const validator =require('validator');
const isEmpty = require('./is-empty');

module.exports = function validatePostInput(data){
    let errors = {};

    data.title = !isEmpty(data.title) ? data.title : '';
    data.description = !isEmpty(data.description) ? data.description : '';
    data.price = !isEmpty(data.price) ? data.price : '';

    if(!validator.isLength(data.title, {min:2, max:20})){
        errors.title = 'Title must be between 2 and 20 characters';
    }
    if (validator.isEmpty(data.title)) {
        errors.title = "Title Field is Required";
    }
    if (!validator.isLength(data.description, { min: 2, max: 300 })){
        errors.description = 'descriiption Must be between 2 and 300 characters';
    }
    if (validator.isEmpty(data.description)){
        errors.description = 'Description field is required';
    }
    if(validator.isEmpty(data.price)){
        errors.price = 'Price field is required';
        
    }

    return{
        errors,
        isValid: isEmpty(errors)
    }
    
}
