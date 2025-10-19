import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestauranPageComponent } from './restauran-page.component';

describe('RestauranPageComponent', () => {
  let component: RestauranPageComponent;
  let fixture: ComponentFixture<RestauranPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RestauranPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestauranPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
