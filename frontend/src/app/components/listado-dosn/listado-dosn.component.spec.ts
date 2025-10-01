import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoDosnComponent } from './listado-dosn.component';

describe('ListadoDosnComponent', () => {
  let component: ListadoDosnComponent;
  let fixture: ComponentFixture<ListadoDosnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoDosnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoDosnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
