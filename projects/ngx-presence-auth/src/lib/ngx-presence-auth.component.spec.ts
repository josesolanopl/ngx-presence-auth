import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxPresenceAuthComponent } from './ngx-presence-auth.component';

describe('NgxPresenceAuthComponent', () => {
  let component: NgxPresenceAuthComponent;
  let fixture: ComponentFixture<NgxPresenceAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxPresenceAuthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxPresenceAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
