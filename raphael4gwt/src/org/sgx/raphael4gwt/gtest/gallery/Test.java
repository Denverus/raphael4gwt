package org.sgx.raphael4gwt.gtest.gallery;

import org.sgx.raphael4gwt.graphael.GPaper;
import org.sgx.raphael4gwt.raphael.Paper;
import org.sgx.raphael4gwt.raphael.Raphael;
import org.sgx.raphael4gwt.raphael.util.Util;

public abstract class Test {
	protected Paper paper=null;
	protected int paperWidth, paperHeight;
	String name=null;
	String description=null;
	String[] tags=null;
	
	public Test(Paper paper, int paperWidth, int paperHeight) {
		this(paper, paperWidth, paperHeight, "", "", new String[]{});
	}
	public Test(Paper paper, int paperWidth, int paperHeight, String name,
			String description, String[] tags) {
		super();
		this.paper = paper;
		this.paperWidth = paperWidth;
		this.paperHeight = paperHeight;
		this.name = name;
		this.description = description;
		this.tags = tags;
	}
	public abstract void test();
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public String[] getTags() {
		return tags;
	}
	public void setTags(String[] tags) {
		this.tags = tags;
	}
	
	public Paper getPaper() {
		return paper;
	}

	public void setPaper(Paper paper) {
		this.paper = paper;
	}

	public int getPaperWidth() {
		return paperWidth;
	}

	public void setPaperWidth(int paperWidth) {
		this.paperWidth = paperWidth;
	}

	public int getPaperHeight() {
		return paperHeight;
	}

	public void setPaperHeight(int paperHeight) {
		this.paperHeight = paperHeight;
	}

	public abstract String getJavaClassSource();

	protected String randomColor() {
		return Util.randomColor();
	}

	public GPaper getGPaper() {
		return (GPaper)paper;
	}
}
