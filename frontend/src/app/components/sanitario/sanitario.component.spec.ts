import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SanitarioComponent } from './sanitario.component';

describe('SanitarioComponent', () => {
  let component: SanitarioComponent;
  let fixture: ComponentFixture<SanitarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SanitarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SanitarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
