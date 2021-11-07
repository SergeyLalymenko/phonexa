(function () {
    /*
    * Variables
    * */
    var MAIN_FORM_ID = 'mainForm';
    var PASSWORD_FIELD_ID = 'password';
    var STEP_ID = 'step';
    var NEXT_BTN_ID = 'control-next';
    var PREV_BTN_ID = 'control-prev';
    var SUBMIT_BTN_ID = 'control-submit';
    var FIRST_STEP_FIELDS_SELECTOR = '.step_active .field';
    var ZIP_FIELD_ID = 'zip';
    var STATE_FIELD_ID = 'state';
    var CITY_FIELD_ID = 'city';
    
    var mainForm = document.getElementById(MAIN_FORM_ID);
    var passwordField = document.getElementById(PASSWORD_FIELD_ID);
    var firstStep = document.getElementById(STEP_ID);
    var nextBtn = document.getElementById(NEXT_BTN_ID);
    var prevBtn = document.getElementById(PREV_BTN_ID);
    var submitBtn = document.getElementById(SUBMIT_BTN_ID);
    var firstStepFields = document.querySelectorAll(FIRST_STEP_FIELDS_SELECTOR);
    var zipField = document.getElementById(ZIP_FIELD_ID);
    var stateField = document.getElementById(STATE_FIELD_ID);
    var cityField = document.getElementById(CITY_FIELD_ID);

    /*
    * Secondary functions
    * */
    function ajax(params) {
        var xhr = new XMLHttpRequest();
        var url = params.url || '';
        var body = params.body || '';
        var success = params.success;
        var error = params.error;

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(body);
        xhr.onload = function () {
            if (xhr.readyState === 4 && xhr.status === 200 && typeof success === 'function') {
                success(xhr.response);       
            } else if (xhr.readyState === 4 && xhr.status !== 200 && typeof error === 'function') {
                error(xhr.response);
            }
        };
        xhr.onerror = error || null;
    }

    function clearFields(fields) {
        for(var i = 0; i < fields.length; i++) {
            fields[i].value = '';
        }
    }

    function toggleSteps() {
        firstStep.classList.toggle('step_active');
        firstStep.nextElementSibling.classList.toggle('step_active');
        nextBtn.classList.toggle('control_hide');
        prevBtn.classList.toggle('control_hide');
        submitBtn.classList.toggle('control_hide');
    }

    function checkFieldValidation(element) {
        if (element.dataset && element.dataset.validation !== undefined) {
            toggleError(element, validateField(element).message);
            return validateField(element).message;
        }
    }

    function isFieldsValid() {
        var isValid = true;

        for(var i = 0; i < firstStepFields.length; i++) {
            var errorMessage = checkFieldValidation(firstStepFields[i]);
            errorMessage && (isValid = false);
        }

        return isValid;
    }

    /*
    * Validation
    * */
    function checkRegExp(pattern, message, value, isConfirmPasswordField) {
        var result = pattern.test(value) ? true : message;

        if(isConfirmPasswordField && value !== passwordField.value && typeof result === 'boolean') {
            result = 'Password mismatch';
        }

        return result;
    }

    var validations = {
        firstName: [
            checkRegExp.bind(null, /^[A-Zа-я]{2,}$/i, 'Field may contain only letters and not be less than 2 letters'),
            checkRegExp.bind(null, /^[A-Zа-я]{2,64}$/i, 'Field may contain only letters and not be more than 64 letters'),
        ],
        lastName: [
            checkRegExp.bind(null, /^[A-Zа-я]{2,}$/i, 'Field may contain only letters and not be less than 2 letters'),
            checkRegExp.bind(null, /^[A-Zа-я]{2,64}$/i, 'Field may contain only letters and not be more than 64 letters'),
        ],
        email: [
            checkRegExp.bind(null,
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please enter valid email'),
        ],
        phone: [
            checkRegExp.bind(null, /^[0-9]{8}$/, 'Field may contain only 8 digits'),
        ],
        password: [
            checkRegExp.bind(null,
                /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\!\@\#\$\%\^\&\*\-])/,
                'Required at least one number (0-9), uppercase and lowercase letters (a-Z) and at least one special character (!@#$%^&*-)'),
        ],
        password2: [
            checkRegExp.bind(null,
                /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[\!\@\#\$\%\^\&\*\-])/,
                'Required at least one number (0-9), uppercase and lowercase letters (a-Z) and at least one special character (!@#$%^&*-)'),
        ],
        zip: [
            checkRegExp.bind(null, /^[0-9]{5}$/, 'Field must include 5 digits and only consist of numeric values'),
        ]
    };

    function validateField(element) {
        var fieldValidation = validations[element.id];
        var result = { valid: true, element: element, message: '' };
        var isConfirmPasswordField = element.id === 'password2' ? true : false;

        if (fieldValidation) {
            for (var i = 0; i < fieldValidation.length; i++) {
                var validationFunction = fieldValidation[i];
                var answer = validationFunction(element.value, isConfirmPasswordField);
                if (typeof answer === 'string') {
                    result.valid = false;
                    result.message = answer;
                    break;
                }
            }
        }

        return result;
    }

    /*
    * Other function
    * */
    function toggleError(element, message) {
        var errorMessageElement = element.nextElementSibling.classList.contains('field-error')
            ? element.nextElementSibling
            : null;

        errorMessageElement && (errorMessageElement.innerHTML = message);
    }

    function onFormChange(e) {
        var message = checkFieldValidation(e.target);

        if(!message && e.target.id === 'zip') {
            var params = {
                url: './api/geoStatus.php',
                body: 'zip=' + e.target.value,
                success: success,
                error: error,
            }
            
            ajax(params);
        } else if(message && e.target.id === 'zip') {
            clearFields([stateField, cityField]);
        }
    }

    function onNextBtnClick() {
        if(isFieldsValid()) {
            toggleSteps();
        }
    }

    function onPrevBtnClick() {
        toggleSteps();
    }

    function onSubmitBtnClick(e) {
        e.preventDefault();

        var message = checkFieldValidation(zipField);
        var isValid = !message;

        if(isValid && stateField.value && cityField.value) {
            mainForm.submit();
        }
    }

    function success(res) {
        if(res === 'allowed') {
            var params = {
                url: './api/geoData.php',
                body: 'zip=' + 11111,
                success: renderData,
                error: error,
            }
            
            ajax(params);
        } else if(res === 'blocked') {
            alert('Zip is blocked!');
            clearFields([zipField, stateField, cityField]);
        }
    }

    function error(res) {
        console.log('error: ', res);
    }

    function renderData(res) {
        var data = JSON.parse(res);

        stateField.value = data.state;
        cityField.value = data.city;
    }

    /*
    * Listeners
    * */
    mainForm.addEventListener('change', onFormChange);
    nextBtn.addEventListener('click', onNextBtnClick);
    prevBtn.addEventListener('click', onPrevBtnClick);
    submitBtn.addEventListener('click', onSubmitBtnClick);
})();
