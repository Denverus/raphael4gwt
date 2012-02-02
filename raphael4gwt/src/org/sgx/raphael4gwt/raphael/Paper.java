package org.sgx.raphael4gwt.raphael;

import org.sgx.raphael4gwt.raphael.base.Font;
import org.sgx.raphael4gwt.raphael.base.NativeFont;
import org.sgx.raphael4gwt.raphael.base.Rectangle;
import org.sgx.raphael4gwt.raphael.event.ForEachCallback;

import com.google.gwt.core.client.JavaScriptObject;
import com.google.gwt.dom.client.Element;
import com.google.gwt.resources.client.ImageResource;

public class Paper extends JavaScriptObject {
	
	protected Paper(){}
	
	/**
	 * 
	 * @param x - x coordinate of the center
	 * @param y - y coordinate of the center
	 * @param r - radius
	 * @return a new Circle Shape
	 */
	public final native Circle circle(int x, int y, int r)/*-{
		return this.circle(x, y, r);
	}-*/;
	/**
	 * Draws a text string. If you need line breaks, put “\n” in the string. 
	 * 
	 * 
	 * @param x
	 * @param y
	 * @param text
	 * @return
	 */
	public final native Text text(int x, int y, String text)/*-{
		return this.text(x, y, text);
	}-*/;
	 /**
	  * If you need to change dimensions of the canvas call this method 
	  * @param w - new paper width
	  * @param h - new paper height
	  */
	public final native void setSize(int w, int h)/*-{
		this.setSize(w, h);
	}-*/;
	/**
	 * Points to the topmost element on the paper 
	 * @return
	 */
	public final native Shape top()/*-{
		this.top;
	}-*/;
	

	/**
	 * Clears the paper, i.e. removes all the elements. 
	 */
	public final native void clear()/*-{
		this.clear();
	}-*/;


	public final native Rect rect(int x, int y, int w, int h)/*-{
//		alert(this.canvas);
		return this.rect(x, y, w, h);
	}-*/;
	/**
	 * Draws a rectangle. 
	 * @param x x coordinate of the top left corner
	 * @param y y coordinate of the top left corner
	 * @param w width
	 * @param h height
	 * @param r radius for rounded corners, default is 0
	 * @return a new Rect shape.
	 */
	public final native Rect rect(int x, int y, int w, int h, int r) /*-{
		return this.rect(x, y, w, h, r);
	}-*/;
	/**
	 * creates a raphael image from GWT ImageResource (using client bundle). <br/>
	 * Important: for creating an raphael image, raphaeljs internally 
	 * needs a "normal url" (not an inline image data: url). So, if working with
	 * GWT ClientBundle, make sure to use <pre>@ImageOptions(preventInlining=true)</pre>
	 *  in your resources definitions like:
	 * 
	 * 
	 * <pre>
	import com.google.gwt.core.client.GWT;
	import com.google.gwt.resources.client.ClientBundle;
	import com.google.gwt.resources.client.ImageResource;
	import com.google.gwt.resources.client.ImageResource.ImageOptions;
	
	public interface TestImageResources extends ClientBundle {
	  TestImageResources INSTANCE = GWT.create(TestImageResources.class);
	
	  @ImageOptions(preventInlining=true)
	  @Source("smallLion.png")
	  ImageResource smallLion();
	  
	}
	</pre>  
	
	 * @param imgRes an imageresource annotated with @ImageOptions(preventInlining=true)
	 * @param x
	 * @param y
	 * @param w
	 * @param h
	 * @return
	 */
	public native final Image image(ImageResource imgRes, int x, int y, int w, int h)/*-{
		var url = @org.sgx.raphael4gwt.raphael.Paper::getImageResourceUrl(Lcom/google/gwt/resources/client/ImageResource;)(imgRes);
		return this.image(url, x, y, w, h);
	}-*/;
	/**
	 * create's a raphael image shape from a normal (not data:) url.
	 * @param imgUrl
	 * @param x
	 * @param y
	 * @param w
	 * @param h
	 * @return
	 */
	public native final Image image(String imgUrl, int x, int y, int w, int h)/*-{
		return this.image(imgUrl, x, y, w, h);
	}-*/;
	public static String getImageResourceUrl(ImageResource imgRes) {
		return imgRes.getSafeUri().asString();
	}
	/**
	 * creates an empty path
	 * @return
	 */
	public native final Path path()/*-{
		return this.path();
	}-*/;
	/**
	 * Creates a path element by given path data string. 
	 * 
	 * Path string consists of one-letter commands, followed by comma seprarated arguments in numercal form. Example: 
	 * <pre>"M10,20L30,40"</pre>
	 * 
Here we can see two commands: “M”, with arguments <code>(10, 20)</code> and “L” with arguments <code>(30, 40)</code>. Upper case letter mean command is absolute, lower case—relative.
</p><p></p><p>Here is short list of commands available, for more details see <a href="http://www.w3.org/TR/SVG/paths.html#PathData" title="Details of a path's data attribute's format are described in the SVG specification.">SVG path string format</a>.</p><table><thead><tr><th>Command</th><th>Name</th><th>Parameters</th></tr></thead><tbody><tr><td>M</td><td>moveto</td><td>(x y)+</td></tr><tr><td>Z</td><td>closepath</td><td>(none)</td></tr><tr><td>L</td><td>lineto</td><td>(x y)+</td></tr><tr><td>H</td><td>horizontal lineto</td><td>x+</td></tr><tr><td>V</td><td>vertical lineto</td><td>y+</td></tr><tr><td>C</td><td>curveto</td><td>(x1 y1 x2 y2 x y)+</td></tr><tr><td>S</td><td>smooth curveto</td><td>(x2 y2 x y)+</td></tr><tr><td>Q</td><td>quadratic Bézier curveto</td><td>(x1 y1 x y)+</td></tr><tr><td>T</td><td>smooth quadratic Bézier curveto</td><td>(x y)+</td></tr><tr><td>A</td><td>elliptical arc</td><td>(rx ry x-axis-rotation large-arc-flag sweep-flag x y)+</td></tr><tr><td>R</td><td><a href="http://en.wikipedia.org/wiki/Catmull%E2%80%93Rom_spline#Catmull.E2.80.93Rom_spline">Catmull-Rom curveto</a>*</td><td>x1 y1 (x y)+</td></tr></tbody></table><p>* “Catmull-Rom curveto” is a not standard SVG command and added in 2.0 to make life easier.
</p>
Usage: 
<pre>
var c = paper.path("M10 10L90 90");
// draw a diagonal line:
// move to 10,10, line to 90,90
</pre>
	 * @param pathString path string in SVG format.
	 * 
	 * @return a new path
	 */
	public native final Path path(String pathString)/*-{
		return this.path(pathString);
	}-*/;
	
	/**
	 * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”. 
	 * @param fontFamily font family name or any word from it
	 * @return
	 */
	public native final Font getFont(String fontFamily)/*-{
		return this.getFont(fontFamily);
	}-*/;
	/**
	 * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”. 
	 * @param fontFamily font family name or any word from it
	 * @param weight - for example "800"
	 * @return
	 */
	public native final NativeFont getFont(String fontFamily, String weight)/*-{
		return this.getFont(fontFamily, weight);
	}-*/;
	
	/**
	 * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”. 
	 * @param fontFamily font family name or any word from it
	 * @param weight - for example "800"
	 * @param style - for example "italic"
	 * @return
	 */
	public native final Font getFont(String fontFamily, String weight, String style)/*-{
		return this.getFont(fontFamily, weight, style);
	}-*/;
	/**
	 * Finds font object in the registered fonts by given parameters. You could specify only one word from the font name, like “Myriad” for “Myriad Pro”. 
	 * @param fontFamily font family name or any word from it
	 * @param weight - for example "800"
	 * @param style - for example "italic"
	 * @return
	 */
	public native final Font getFont(String fontFamily, String weight, String style, String stretch)/*-{
		return this.getFont(fontFamily, weight, style, stretch);
	}-*/;
	
	public native final Paper forEach(ForEachCallback c)/*-{
//		var f = $entry(function(){
//			c.@org.sgx.raphael4gwt.raphael.event.ForEachCallback::call(Lorg/sgx/raphael4gwt/raphael/Shape;I)(this);
//		});
//		return this.forEach(f);

		var f = $entry(function(shape, index){
			c.@org.sgx.raphael4gwt.raphael.event.ForEachCallback::call(Lorg/sgx/raphael4gwt/raphael/Shape;I)(shape, index);
		});
		return this.forEach(f, null);
	}-*/;
	
//	/**
//	 * Creates set of shapes to represent given font at given position with given size. Result of the method is set object (see Paper.set) which contains each letter as separate path object.
//	 * Usage: 
//	 * <pre>
//var txt = r.print(10, 50, "print", r.getFont("Museo"), 30).attr({fill: "#fff"});
//// following line will paint first letter in red
//txt[0].attr({fill: "#f00"});
//
//	 * </pre> 
//	 * @param x x position of the text
//	 * @param y y position of the text
//	 * @param text text to print
//	 * @param font font object, see Paper.getFont
//	 * @return
//	 */
//	public native final Set print(int x, int y, String text, Font font)/*-{
//		
//	}-*/;

	/**
	 * @return element by its internal ID. 
	 */
	public native final Shape getById(int id)/*-{
		return this.getById(id);
	}-*/;

	/**
	 * Use it like:
	 * <pre>
	 * paper.getElementByPoint(mouseX, mouseY).attr({stroke: "#f00"});
	 * </pre>
	 * @return topmost element under given point. 
	 * @param x coordinate from the top left corner of the window
	 * @param y coordinate from the top left corner of the window
	 */
	public native final Shape getElementByPoint(int x, int y)/*-{
		return this.getElementByPoint(x, y);
	}-*/;
	
	
	/* *** SETS *** */
	/**
	 * Creates array-like object to keep and operate several elements at once.
	 * @return
	 */
	public final native Set set()/*-{
		return this.set();
	}-*/;

	public final native void setStart()/*-{
		this.setStart();
	}-*/;
	/**
	 * This method finishes catching and returns resulting set.
	 * @return the new set
	 */
	public final native Set setFinish()/*-{
		return this.setFinish();
	}-*/;

	/**
	 * Draws an ellipse. 
	 * @param x x coordinate of the centre
	 * @param y y coordinate of the centre
	 * @param rx horizontal radius
	 * @param ry vertical radius
	 * @return
	 */
	public final native Ellipse ellipse(int x, int y, int rx, int ry)/*-{
		return this.ellipse(x, y, rx, ry);
	}-*/;


	
	/**
	 * safe entry point (managed by gwt.dom.client) for acessing HTML DOM RElated information on this paper
	 * for example, knowing paper position, attributes, "paper html element" 
	 * @return
	 */
	public final native Element getCanvasElement()/*-{
		return this.canvas;
	}-*/;
	
//	public Rectangle getPaperBounds() {
//		Raphael.createRectangle(getCanvasElement().getAbsoluteLeft(), 
//				getCanvasElement().getAbsoluteTop())
//		
//	}
	
}
