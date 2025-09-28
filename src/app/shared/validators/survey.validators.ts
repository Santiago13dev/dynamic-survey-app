import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export class SurveyValidators {
  
  static titleValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return { required: true };
      }
      
      if (value.length < 3) {
        return { minLength: { requiredLength: 3, actualLength: value.length } };
      }
      
      if (value.length > 100) {
        return { maxLength: { requiredLength: 100, actualLength: value.length } };
      }
      
      // Check for inappropriate content (basic filter)
      const inappropriateWords = ['spam', 'test123', 'asdasd'];
      if (inappropriateWords.some(word => value.toLowerCase().includes(word))) {
        return { inappropriate: true };
      }
      
      return null;
    };
  }
  
  static descriptionValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value && value.length > 500) {
        return { maxLength: { requiredLength: 500, actualLength: value.length } };
      }
      
      return null;
    };
  }
  
  static durationValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return { required: true };
      }
      
      if (value < 1) {
        return { min: { min: 1, actual: value } };
      }
      
      if (value > 120) {
        return { max: { max: 120, actual: value } };
      }
      
      return null;
    };
  }
  
  static questionsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) {
        return null;
      }
      
      const questions = control.value;
      
      if (!questions || questions.length === 0) {
        return { noQuestions: true };
      }
      
      if (questions.length > 50) {
        return { tooManyQuestions: { max: 50, actual: questions.length } };
      }
      
      // Validate each question has text
      const emptyQuestions = questions.some((q: any) => !q.text || q.text.trim().length === 0);
      if (emptyQuestions) {
        return { emptyQuestions: true };
      }
      
      // Validate multiple choice and checkbox questions have options
      const invalidOptions = questions.some((q: any) => {
        if (q.type === 'multiple-choice' || q.type === 'checkbox') {
          return !q.options || q.options.length < 2;
        }
        return false;
      });
      
      if (invalidOptions) {
        return { invalidOptions: true };
      }
      
      return null;
    };
  }
  
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null; // Let required validator handle empty values
      }
      
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
      if (!emailRegex.test(value)) {
        return { invalidEmail: true };
      }
      
      return null;
    };
  }
}