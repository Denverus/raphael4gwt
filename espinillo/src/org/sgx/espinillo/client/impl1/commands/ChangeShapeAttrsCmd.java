package org.sgx.espinillo.client.impl1.commands;

import org.sgx.espinillo.client.model.AbstractCommand;
import org.sgx.espinillo.client.model.Document;
import org.sgx.raphael4gwt.raphael.Shape;
import org.sgx.raphael4gwt.raphael.base.Attrs;

public class ChangeShapeAttrsCmd extends AbstractCommand {

	Shape shape;
	Attrs oldAttrs, newAttrs;
	
	public ChangeShapeAttrsCmd(Document drawing, Shape shape, Attrs newAttrs) {
		super("change attrs", drawing);
		this.shape=shape;
		this.newAttrs=newAttrs;
	}
	@Override
	public boolean doIt() {
		oldAttrs=shape.attr();
		shape.attr(newAttrs);
		return true;
	}

	@Override
	public boolean undoIt() {
		shape.attr(oldAttrs);
		return true;
	}
	public Shape getShape() {
		return shape;
	}
	public void setShape(Shape shape) {
		this.shape = shape;
	}
	public Attrs getOldAttrs() {
		return oldAttrs;
	}
	public void setOldAttrs(Attrs oldAttrs) {
		this.oldAttrs = oldAttrs;
	}
	public Attrs getNewAttrs() {
		return newAttrs;
	}
	public void setNewAttrs(Attrs newAttrs) {
		this.newAttrs = newAttrs;
	}

	
}
