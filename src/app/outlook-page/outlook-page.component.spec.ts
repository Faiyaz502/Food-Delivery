import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutlookPageComponent } from './outlook-page.component';

describe('OutlookPageComponent', () => {
  let component: OutlookPageComponent;
  let fixture: ComponentFixture<OutlookPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutlookPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OutlookPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
