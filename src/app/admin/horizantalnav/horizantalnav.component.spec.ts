import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizantalnavComponent } from './horizantalnav.component';

describe('HorizantalnavComponent', () => {
  let component: HorizantalnavComponent;
  let fixture: ComponentFixture<HorizantalnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorizantalnavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorizantalnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
