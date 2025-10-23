import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent {
 registerForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  apiUrl = 'http://localhost:8080/api/users'; // ✅ your backend endpoint

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phoneNumber: ['', [Validators.required, Validators.maxLength(20)]],
      password: ['', [Validators.required]],
      primaryRole: ['', [Validators.required]],
      dateOfBirth: [''],
      imageUrl: [null]
    });
  }

  // ✅ Handle image selection
  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.registerForm.patchValue({ imageUrl: file });
      this.registerForm.get('imageUrl')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result);
      reader.readAsDataURL(file);
    }
  }

  // ✅ Submit form
  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

const formData = new FormData();

Object.entries(this.registerForm.value).forEach(([key, value]) => {
  if (value instanceof File) {
    // ✅ Handle file separately
    formData.append(key, value, value.name);
  } else if (value !== null && value !== undefined) {
    // ✅ Convert non-file values to strings
    formData.append(key, String(value));
  }
});


    this.http.post(this.apiUrl, formData).subscribe({
      next: (res) => alert('User registered successfully!'),
      error: (err) => console.error(err),
    });
  }
  
}
