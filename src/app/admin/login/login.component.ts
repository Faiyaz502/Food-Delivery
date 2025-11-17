import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthServiceService } from 'src/app/services/authService/auth-service.service';
declare var particlesJS: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
username = '';
  password = '';
  rememberMe = false;
   loading = false;
  error: string | null = null;
  returnUrl = 'admin/dashboard';

  constructor(private auth: AuthServiceService, private router: Router, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    // You'd typically include validation logic or data fetching here.

      if(this.auth.isLoggedIn()){

       this.router.navigate(['admin/dashboard']);

      }


  }

  // Initialize particles.js after the component's view has been initialized
  ngAfterViewInit(): void {
    this.initParticles();
  }

  // Method to initialize particles.js configuration
  initParticles(): void {
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        "particles": {
          "number": { "value": 100, "density": { "enable": true, "value_area": 800 } },
          "color": { "value": "#00d4ff" },
          "shape": { "type": "circle", "stroke": { "width": 0, "color": "#000000" }, "polygon": { "nb_sides": 5 } },
          "opacity": { "value": 0.8, "random": true, "anim": { "enable": true, "speed": 1, "opacity_min": 0.4, "sync": false } },
          "size": { "value": 5, "random": true, "anim": { "enable": true, "speed": 2, "size_min": 1, "sync": false } },
          "line_linked": { "enable": true, "distance": 150, "color": "#00d4ff", "opacity": 0.6, "width": 1.5 },
          "move": { "enable": true, "speed": 2, "direction": "none", "random": true, "straight": false, "out_mode": "out", "bounce": false, "attract": { "enable": true, "rotateX": 600, "rotateY": 1200 } }
        },
        "interactivity": {
          "detect_on": "canvas",
          "events": {
            "onhover": { "enable": true, "mode": "repulse" },
            "onclick": { "enable": true, "mode": "push" },
            "resize": true
          },
          "modes": {
            "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
            "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
            "repulse": { "distance": 100, "duration": 0.4 },
            "push": { "particles_nb": 4 },
            "remove": { "particles_nb": 2 }
          }
        },
        "retina_detect": true
      });
    }
  }

  // Placeholder for the form submission logic
 async submit() {
    this.loading = true;
    this.error = null;
    try {
      await this.auth.login(this.username, this.password);
      console.log("navigate");

      setTimeout(() => {
  this.router.navigate(['/admin/dashboard']);
}, 0);


    } catch (err: any) {
      this.error = err?.message || 'Login failed';
    } finally {
      this.loading = false;
    }
  }


  //Login



}
