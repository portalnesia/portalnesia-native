package com.portalnesia.app.fastimage;

import android.content.Context;

import com.bumptech.glide.load.model.GlideUrl;

public class PNImageView extends androidx.appcompat.widget.AppCompatImageView {
    public GlideUrl glideUrl;

    public PNImageView(Context context){
        super(context);
    }
}
