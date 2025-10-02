import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListadoPurezaComponent } from './listado-pureza.component';

describe('ListadoPurezaComponent', () => {
  let component: ListadoPurezaComponent;
  let fixture: ComponentFixture<ListadoPurezaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListadoPurezaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListadoPurezaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
