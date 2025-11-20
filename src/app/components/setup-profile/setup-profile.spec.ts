import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupProfile } from './setup-profile';

describe('SetupProfile', () => {
  let component: SetupProfile;
  let fixture: ComponentFixture<SetupProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupProfile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
