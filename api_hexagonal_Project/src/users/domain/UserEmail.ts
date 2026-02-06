export class UserEmail {
    value: String;
    
    constructor(value: String) {
        this.value = value;
    }
    private ensureIsValidEmail(){
        // Basic email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.value.toString())) {
            throw new Error("Invalid email format");
        }
    }
}